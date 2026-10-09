export function AdminFeedback({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;
  const success = Array.isArray(searchParams.success) ? searchParams.success[0] : searchParams.success;
  if (error) {
    const message = error === "invalid"
      ? "Ada data yang belum benar. Periksa kembali formulir."
      : error === "delete"
        ? "Data tidak dapat dihapus. Pastikan tidak ada riwayat yang memakai data ini."
        : error === "image"
          ? "Produk tersimpan, tetapi foto belum tersimpan. Coba unggah kembali."
        : error === "variant"
          ? "Varian belum tersimpan. Periksa SKU, nilai harga, dan koneksi."
        : "Perubahan belum tersimpan. Coba lagi atau periksa koneksi.";
    return <p className="form-error" role="alert">{message}</p>;
  }
  if (success) {
    const message = success === "created" ? "Data berhasil ditambahkan."
      : success === "deleted" ? "Data berhasil dihapus."
        : success === "variant" ? "Varian berhasil diperbarui."
        : "Perubahan berhasil disimpan.";
    return <p className="form-success" role="status">{message}</p>;
  }
  return null;
}
