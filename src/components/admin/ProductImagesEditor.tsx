"use client";

import Image from "next/image";
import { ChangeEvent, useId, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { ProductImage } from "@/types/database";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const fileExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const maxImages = 20;

type EditableImage = {
  id: string | null;
  image_url: string;
  alt_text: string;
};

export function ProductImagesEditor({ initialImages }: { initialImages: ProductImage[] }) {
  const inputId = useId();
  const [images, setImages] = useState<EditableImage[]>(() => initialImages.map((image) => ({
    id: image.id,
    image_url: image.image_url,
    alt_text: image.alt_text,
  })));
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > maxImages) {
      setStatus(`Satu produk dapat memiliki maksimal ${maxImages} foto.`);
      input.value = "";
      return;
    }
    const invalidFile = files.find((file) => !allowedTypes.includes(file.type)
      || file.size > 5 * 1024 * 1024);
    if (invalidFile) {
      setStatus(allowedTypes.includes(invalidFile.type)
        ? "Ukuran setiap foto maksimal 5 MB."
        : "Pilih foto JPEG, PNG, atau WebP.");
      input.value = "";
      return;
    }

    setBusy(true);
    setStatus("Mengunggah foto produk...");
    try {
      const supabase = getBrowserSupabaseClient();
      for (const file of files) {
        const path = `${crypto.randomUUID()}.${fileExtensions[file.type]}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });
        if (error) {
          console.error("Product image upload failed.", error);
          setStatus("Sebagian foto belum terunggah. Periksa akses Admin lalu coba lagi.");
          return;
        }
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        setImages((current) => [...current, {
          id: null,
          image_url: data.publicUrl,
          alt_text: "",
        }]);
      }
      setStatus("Foto berhasil diunggah. Simpan formulir produk untuk menerapkannya.");
    } catch (error) {
      console.error("Product image upload could not be completed.", error);
      setStatus("Koneksi penyimpanan belum tersedia.");
    } finally {
      setBusy(false);
      input.value = "";
    }
  }

  function updateImage(index: number, patch: Partial<EditableImage>) {
    setImages((current) => current.map((image, imageIndex) => (
      imageIndex === index ? { ...image, ...patch } : image
    )));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <div className="field-label product-images-editor">
      <label htmlFor={inputId}>Foto produk</label>
      <input
        id={inputId}
        type="file"
        accept={allowedTypes.join(",")}
        multiple
        onChange={upload}
        disabled={busy || images.length >= maxImages}
        aria-describedby={`${inputId}-hint ${inputId}-status`}
      />
      <span id={`${inputId}-hint`} className="upload-hint">
        Unggah beberapa foto agar pelanggan dapat melihat detail produk. JPEG, PNG, atau WebP, maksimal 5 MB per foto.
      </span>
      <input type="hidden" name="product_images" value={JSON.stringify(images)} />
      {images.length ? (
        <ol className="product-images-list">
          {images.map((image, index) => (
            <li className="product-image-edit-row" key={image.id ?? image.image_url}>
              <div className="product-image-edit-preview">
                <Image src={image.image_url} alt="" fill sizes="100px" />
              </div>
              <label className="field-label">
                Keterangan foto {index + 1}
                <input
                  value={image.alt_text}
                  maxLength={250}
                  onChange={(event) => updateImage(index, { alt_text: event.target.value })}
                  placeholder="Jelaskan isi foto"
                />
              </label>
              <div className="product-image-edit-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  aria-label={`Pindahkan foto ${index + 1} ke urutan sebelumnya`}
                >Naik</button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label={`Pindahkan foto ${index + 1} ke urutan berikutnya`}
                >Turun</button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                  aria-label={`Hapus foto ${index + 1}`}
                >Hapus</button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="admin-empty-state">Belum ada foto. Produk tetap dapat disimpan tanpa foto.</p>
      )}
      <span
        id={`${inputId}-status`}
        className={status.includes("berhasil") || status.includes("Simpan") ? "form-success" : "form-error"}
        role={status && (status.includes("belum") || status.includes("maksimal") || status.includes("Pilih")) ? "alert" : "status"}
      >
        {status}
      </span>
    </div>
  );
}
