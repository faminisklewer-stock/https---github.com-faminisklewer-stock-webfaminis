import Link from "next/link";
import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import type { Order } from "@/types/database";

export const metadata: Metadata = {
  title: "Akun",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null }, error: null };

  if (authError && authError.name !== "AuthSessionMissingError") {
    console.error("Account page could not validate the current session.", authError);
    throw new Error("Akun belum dapat dimuat.");
  }
  if (!supabase || !authData.user) {
    return (
      <div className="page-wrap auth-page">
        <div className="auth-content">
          <header className="auth-heading">
            <h1>Belanja tanpa akun juga bisa.</h1>
            <p>Masuk untuk melihat riwayat pesanan. Anda juga bisa memilih produk dan memesan tanpa mendaftar.</p>
          </header>
          <div className="account-guest-options">
            <Link className="button button-primary button-wide" href="/produk">Lihat produk tanpa akun</Link>
            <div className="auth-links">
              <Link href="/login">Masuk ke akun</Link>
              <Link href="/register">Buat akun</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = authData.user;
  const [profileResult, orderResult, favoriteResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("orders")
      .select("id, order_number, grand_total, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("favorites").select("product_id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (profileResult.error || orderResult.error || favoriteResult.error) throw new Error("Data akun belum dapat dimuat.");
  const profile = profileResult.data;
  const favoriteIds = (favoriteResult.data ?? []).map((favorite) => favorite.product_id);
  const favoritesResult = favoriteIds.length
    ? await supabase.from("products").select("id, name, slug, ecer_price").in("id", favoriteIds).eq("is_active", true)
    : { data: [], error: null };
  if (favoritesResult.error) throw new Error("Produk favorit belum dapat dimuat.");
  const favoriteProducts = (favoritesResult.data ?? []).sort(
    (a, b) => favoriteIds.indexOf(a.id) - favoriteIds.indexOf(b.id),
  );
  const resellerAccess = profile?.member_status === "ACTIVE"
    ? await supabase.rpc("get_reseller_group_url", {})
    : null;
  if (resellerAccess?.error) {
    console.error("Reseller group access could not be checked.", resellerAccess.error);
  }
  const orders = (orderResult.data ?? []) as Pick<Order, "id" | "order_number" | "grand_total" | "status" | "created_at">[];

  return (
    <div className="page-wrap account-page">
      <div className="account-heading">
        <div><p className="section-eyebrow">{tab === "pesanan" ? "Riwayat belanja" : "Akun pelanggan"}</p><h1>Halo, {profile?.full_name || "Member"}</h1></div>
        {profile?.member_status === "ACTIVE" ? <span className="account-status">MEMBER</span> : <span className="account-status">NONAKTIF</span>}
      </div>
      <div className="account-grid">
        <section className="account-card">
          <h2>Profil</h2>
          <p>{profile?.email || user.email}</p>
          <p>{profile?.phone || "Nomor WhatsApp belum diisi"}</p>
          <p>Jenis pelanggan: {profile?.customer_type ?? "ECER"}</p>
          <p>Status reseller: {profile?.reseller_status ?? "NONE"}</p>
          <SignOutButton />
        </section>
        <section className="account-card">
          <h2>Program reseller</h2>
          {resellerAccess?.error ? (
            <p role="alert">Akses grup belum dapat dimuat. Muat ulang halaman atau hubungi Admin.</p>
          ) : resellerAccess?.data ? (
            <a href={resellerAccess.data} target="_blank" rel="noreferrer">Gabung grup WhatsApp reseller</a>
          ) : profile?.member_status === "ACTIVE" ? (
            <p>Link grup belum diatur Admin. Periksa kembali nanti.</p>
          ) : (
            <p>Masuk sebagai member aktif untuk melihat akses grup reseller.</p>
          )}
          <p><Link href="/reseller">Baca informasi program</Link></p>
        </section>
        <section className="account-card">
          <h2>Benefit member</h2>
          <p>Diskon member mengikuti aturan aktif yang disiapkan Admin.</p>
          <p>Harga akhir akan dihitung saat permintaan pesanan dibuat.</p>
        </section>
        <section className="account-card account-orders">
          <h2>Riwayat pesanan</h2>
          {orders.length ? orders.map((order) => (
            <div className="account-order" key={order.id}>
              <strong>{order.order_number}</strong>
              <p>{new Date(order.created_at).toLocaleDateString("id-ID")} · {order.status}</p>
              <p>Estimasi: {formatRupiah(Number(order.grand_total))}</p>
            </div>
          )) : <p>Belum ada pesanan dari akun ini. Pesanan guest tidak terhubung ke akun.</p>}
        </section>
        <section className="account-card account-orders">
          <h2>Produk favorit</h2>
          {favoriteProducts.length ? favoriteProducts.map((product) => (
            <div className="account-order account-favorite" key={product.id}>
              <div><Link href={`/produk/${product.slug}`}><strong>{product.name}</strong></Link><p>{formatRupiah(Number(product.ecer_price))}</p></div>
              <FavoriteButton productId={product.id} />
            </div>
          )) : <p>Belum ada produk favorit tersimpan.</p>}
        </section>
      </div>
    </div>
  );
}
