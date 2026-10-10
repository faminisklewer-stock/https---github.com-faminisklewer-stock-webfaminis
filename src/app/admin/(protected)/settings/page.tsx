import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/admin";
import { updateSiteSettings } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const settingsResult = await supabase.from("site_settings")
    .select("id, site_name, logo_url, favicon_url, whatsapp_admin_number, instagram_url, tiktok_url, facebook_url, google_maps_url, shopee_url, shop_photo_url, address, store_description, email, phone, member_program_enabled, member_discount_enabled, member_program_description, reseller_program_description, default_seo_title, default_meta_description, created_at, updated_at")
    .eq("id", true).maybeSingle();
  if (
    settingsResult.error
    && settingsResult.error.message.includes("store_description")
    && /does not exist|schema cache/i.test(settingsResult.error.message)
  ) {
    console.error("Admin settings are unavailable until the store description migration is applied.", settingsResult.error);
    return (
      <main className="admin-page">
        <AdminPageHeader
          eyebrow="Konfigurasi toko"
          title="Pengaturan"
          description="Kelola kontak toko dan tautan resmi Faminis Barokah."
        />
        <section className="admin-state-panel" role="alert">
          <h2>Migrasi pengaturan toko belum dijalankan</h2>
          <p>Jalankan migrasi store_description di Supabase agar pengaturan dapat dimuat dan disimpan.</p>
        </section>
      </main>
    );
  }
  if (settingsResult.error) throw new Error(`Gagal memuat pengaturan situs: ${settingsResult.error.message}`);
  if (!settingsResult.data) throw new Error("Pengaturan situs belum dibuat. Jalankan migration Supabase.");
  const settings = settingsResult.data;

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Konfigurasi toko"
        title="Pengaturan"
        description="Kelola kontak toko dan tautan resmi Faminis Barokah."
      />
      <AdminFeedback searchParams={params} />
      <section className="admin-settings-panel">
        <form action={updateSiteSettings} className="admin-form admin-settings-form">
          <fieldset className="admin-form-section">
            <legend>Kontak pelanggan</legend>
            <p className="form-help">Semua tombol WhatsApp di toko memakai nomor ini. Masukkan nomor lokal atau internasional, lalu pesan otomatis menyesuaikan halaman dan keperluan pelanggan.</p>
            <div className="field-grid">
              <label className="field-label">WhatsApp Admin<input name="whatsapp_admin_number" type="tel" defaultValue={settings.whatsapp_admin_number ?? ""} required /></label>
              <label className="field-label">Nomor telepon<input name="phone" type="tel" defaultValue={settings.phone ?? ""} /></label>
              <label className="field-label">Email<input name="email" type="email" defaultValue={settings.email ?? ""} /></label>
              <label className="field-label">Alamat toko<textarea name="address" defaultValue={settings.address ?? ""} maxLength={500} /></label>
              <label className="field-label">Deskripsi toko untuk halaman Kontak<textarea name="store_description" defaultValue={settings.store_description ?? ""} maxLength={1500} /></label>
            </div>
          </fieldset>
          <fieldset className="admin-form-section">
            <legend>Toko dan marketplace</legend>
            <p className="form-help">Foto toko tampil di bagian atas Kontak. Tautan hanya ditampilkan jika sudah diisi.</p>
            <ImageUploader bucket="site-assets" fieldName="shop_photo_url" initialUrl={settings.shop_photo_url ?? ""} label="Foto toko" maxFileSizeMB={5} />
            <div className="field-grid">
              <label className="field-label">Google Maps<input name="google_maps_url" type="url" defaultValue={settings.google_maps_url ?? ""} placeholder="https://maps.google.com/..." /></label>
              <label className="field-label">Shopee<input name="shopee_url" type="url" defaultValue={settings.shopee_url ?? ""} placeholder="https://shopee.co.id/..." /></label>
            </div>
          </fieldset>
          <fieldset className="admin-form-section">
            <legend>Media sosial</legend>
            <p className="form-help">Isi tautan akun resmi. Kolom boleh dibiarkan kosong jika belum digunakan.</p>
            <div className="field-grid">
              <label className="field-label">Instagram<input name="instagram_url" type="url" defaultValue={settings.instagram_url ?? ""} /></label>
              <label className="field-label">TikTok<input name="tiktok_url" type="url" defaultValue={settings.tiktok_url ?? ""} /></label>
              <label className="field-label">Facebook<input name="facebook_url" type="url" defaultValue={settings.facebook_url ?? ""} /></label>
            </div>
          </fieldset>
          <div className="admin-form-submit">
            <p className="form-help">Perubahan berlaku pada tampilan toko setelah disimpan.</p>
            <button className="button button-primary" type="submit">Simpan pengaturan</button>
          </div>
        </form>
      </section>
    </main>
  );
}
