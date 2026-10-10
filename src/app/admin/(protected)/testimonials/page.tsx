import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { requireAdmin } from "@/lib/admin";
import { createTestimonial, deleteTestimonial, updateTestimonial } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ supabase }, params] = await Promise.all([requireAdmin(), searchParams]);
  const { data, error } = await supabase.from("testimonials")
    .select("id, customer_name, content, sort_order, is_active, created_at, updated_at")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin testimonials could not be loaded.", error);
    return (
      <main className="admin-page">
        <AdminPageHeader
          eyebrow="Beranda"
          title="Testimoni pelanggan"
          description="Tampilkan ulasan pelanggan yang benar dan sudah mendapat izin."
        />
        <section className="admin-state-panel" role="alert">
          <h2>Testimoni belum dapat dimuat</h2>
          <p>Pastikan koneksi Supabase tersedia dan migrasi testimoni sudah dijalankan.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="Beranda"
        title="Testimoni pelanggan"
        description="Masukkan ulasan asli yang sudah mendapat izin untuk ditampilkan di Beranda."
      />
      <AdminFeedback searchParams={params} />
      <section className="admin-work-queue testimonial-admin-list">
        <h2>Ulasan tersimpan</h2>
        {data.length ? data.map((testimonial) => (
          <details className="testimonial-admin-item" key={testimonial.id}>
            <summary>
              <span>{testimonial.customer_name}</span>
              <span>{testimonial.is_active ? "Ditampilkan di Beranda" : "Disembunyikan"}</span>
            </summary>
            <form action={updateTestimonial} className="admin-form">
              <input type="hidden" name="id" value={testimonial.id} />
              <label className="field-label">Nama yang ditampilkan
                <input name="customer_name" defaultValue={testimonial.customer_name} required minLength={2} maxLength={100} />
              </label>
              <label className="field-label">Isi testimoni
                <textarea name="content" defaultValue={testimonial.content} required minLength={5} maxLength={1200} />
              </label>
              <label className="field-label">Urutan tampil
                <input name="sort_order" type="number" defaultValue={testimonial.sort_order} min="-100000" max="100000" />
              </label>
              <label className="check-label">
                <input name="is_active" type="checkbox" defaultChecked={testimonial.is_active} /> Tampilkan di Beranda
              </label>
              <button className="button button-primary" type="submit">Simpan testimoni</button>
            </form>
            <form action={deleteTestimonial} className="admin-delete-form">
              <input type="hidden" name="id" value={testimonial.id} />
              <ConfirmSubmitButton message={`Hapus testimoni ${testimonial.customer_name}?`}>
                Hapus testimoni
              </ConfirmSubmitButton>
            </form>
          </details>
        )) : (
          <p className="admin-empty-state">Belum ada ulasan. Tambahkan testimoni asli di formulir berikut.</p>
        )}
      </section>
      <section className="admin-work-queue">
        <h2>Tambah testimoni</h2>
        <p className="form-help">Jangan masukkan ulasan tanpa persetujuan pelanggan. Nama bisa disamarkan bila pelanggan memintanya.</p>
        <form action={createTestimonial} className="admin-form">
          <label className="field-label">Nama yang ditampilkan
            <input name="customer_name" required minLength={2} maxLength={100} />
          </label>
          <label className="field-label">Isi testimoni
            <textarea name="content" required minLength={5} maxLength={1200} />
          </label>
          <label className="field-label">Urutan tampil
            <input name="sort_order" type="number" defaultValue="0" min="-100000" max="100000" />
          </label>
          <label className="check-label">
            <input name="is_active" type="checkbox" defaultChecked /> Tampilkan di Beranda
          </label>
          <button className="button button-primary" type="submit">Tambah testimoni</button>
        </form>
      </section>
    </main>
  );
}
