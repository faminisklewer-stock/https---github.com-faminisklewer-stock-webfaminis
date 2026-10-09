import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { requireAdmin } from "@/lib/admin";
import { updateSiteSettings } from "@/app/admin/actions";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const [settingsResult, groupUrlResult] = await Promise.all([
    supabase.from("site_settings")
      .select("id, site_name, logo_url, favicon_url, whatsapp_admin_number, instagram_url, tiktok_url, facebook_url, address, email, phone, member_program_enabled, member_discount_enabled, member_program_description, reseller_program_description, default_seo_title, default_meta_description, created_at, updated_at")
      .eq("id", true).maybeSingle(),
    supabase.rpc("get_admin_reseller_group_url"),
  ]);
  if (settingsResult.error) throw new Error(`Gagal memuat pengaturan situs: ${settingsResult.error.message}`);
  if (groupUrlResult.error) throw new Error(`Gagal memuat tautan grup reseller: ${groupUrlResult.error.message}`);
  if (!settingsResult.data) throw new Error("Pengaturan situs belum dibuat. Jalankan migration Supabase.");
  const settings = { ...settingsResult.data, reseller_whatsapp_group_url: groupUrlResult.data };

  return (
    <main className="admin-page">
      <div className="admin-page-heading"><div><p className="section-eyebrow">Konfigurasi toko</p><h1>Pengaturan</h1></div></div>
      <AdminFeedback searchParams={params} />
      <section className="admin-panel">
        <h2>Kontak dan program</h2>
        <form action={updateSiteSettings} className="admin-form">
          <div className="field-grid">
            <label className="field-label">Nomor WhatsApp Admin<input name="whatsapp_admin_number" type="tel" defaultValue={settings.whatsapp_admin_number ?? ""} required /></label>
            <label className="field-label">Nomor telepon<input name="phone" type="tel" defaultValue={settings.phone ?? ""} /></label>
            <label className="field-label">Email<input name="email" type="email" defaultValue={settings.email ?? ""} /></label>
            <label className="field-label">Alamat<textarea name="address" defaultValue={settings.address ?? ""} maxLength={500} /></label>
            <label className="field-label">Link grup reseller, HTTPS
              <input name="reseller_whatsapp_group_url" type="url" defaultValue={settings.reseller_whatsapp_group_url ?? ""} />
            </label>
            <label className="field-label">Instagram<input name="instagram_url" type="url" defaultValue={settings.instagram_url ?? ""} /></label>
            <label className="field-label">TikTok<input name="tiktok_url" type="url" defaultValue={settings.tiktok_url ?? ""} /></label>
            <label className="field-label">Facebook<input name="facebook_url" type="url" defaultValue={settings.facebook_url ?? ""} /></label>
          </div>
          <p className="form-help">Link grup reseller hanya dibaca lewat RPC setelah server memeriksa status member. Nomor WhatsApp dari sini dipakai untuk tanya stok dan checkout.</p>
          <button className="button button-primary" type="submit">Simpan pengaturan</button>
        </form>
      </section>
    </main>
  );
}
