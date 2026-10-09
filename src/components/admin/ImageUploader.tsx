"use client";

import { ChangeEvent, useId, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type ImageBucket = "product-images" | "category-images" | "banner-images" | "site-assets";
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const fileExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function ImageUploader({
  bucket,
  fieldName = "image_url",
  initialUrl = "",
  label = "Foto utama",
  maxFileSizeMB = 5,
  helperText,
}: {
  bucket: ImageBucket;
  fieldName?: string;
  initialUrl?: string;
  label?: string;
  maxFileSizeMB?: number;
  helperText?: string;
}) {
  const inputId = useId();
  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setStatus("Pilih gambar JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setStatus(`Ukuran gambar maksimal ${maxFileSizeMB} MB.`);
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const supabase = getBrowserSupabaseClient();
      const path = `${crypto.randomUUID()}.${fileExtensions[file.type]}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) {
        console.error("Supabase Storage upload failed.", error);
        setStatus("Gambar belum terunggah. Pastikan akun memiliki akses Admin.");
        return;
      }
      const result = supabase.storage.from(bucket).getPublicUrl(path);
      setUrl(result.data.publicUrl);
      setStatus("Gambar berhasil diunggah.");
    } catch (error) {
      console.error("Image upload could not be completed.", error);
      setStatus("Koneksi penyimpanan belum tersedia.");
    } finally {
      setBusy(false);
      input.value = "";
    }
  }

  return (
    <div className="field-label image-upload-field">
      <label htmlFor={inputId}>{label}</label>
      <input type="hidden" name={fieldName} value={url} />
      <input id={inputId} type="file" accept={allowedTypes.join(",")} onChange={upload} disabled={busy} />
      <span className="upload-hint">
        {helperText ? `${helperText} ` : ""}JPEG, PNG, atau WebP. Maksimal {maxFileSizeMB} MB.
      </span>
      {url ? <a href={url} target="_blank" rel="noreferrer">Lihat foto yang tersimpan</a> : null}
      {status ? (
        <span
          className={status.includes("berhasil") ? "form-success" : "form-error"}
          role={status.includes("berhasil") ? "status" : "alert"}
        >
          {status}
        </span>
      ) : null}
    </div>
  );
}
