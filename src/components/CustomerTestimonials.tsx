import type { Testimonial } from "@/types/database";

export function CustomerTestimonials({
  testimonials,
  loadState,
}: {
  testimonials: Testimonial[];
  loadState: "ready" | "error";
}) {
  return (
    <section className="customer-testimonials section-wrap" aria-labelledby="testimonials-title">
      <div className="wrap">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Cerita pelanggan</p>
            <h2 id="testimonials-title">Testimoni pelanggan</h2>
          </div>
        </div>
        {loadState === "error" ? (
          <p className="inline-empty" role="alert">Ulasan pelanggan belum dapat dimuat. Muat ulang halaman atau hubungi Admin jika masalah berlanjut.</p>
        ) : testimonials.length ? (
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <figure className="testimonial-card" key={testimonial.id}>
                <blockquote>{testimonial.content}</blockquote>
                <figcaption>{testimonial.customer_name}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="inline-empty" role="status">Ulasan pelanggan akan tampil setelah Admin menambahkan testimoni yang sudah mendapat izin.</p>
        )}
      </div>
    </section>
  );
}
