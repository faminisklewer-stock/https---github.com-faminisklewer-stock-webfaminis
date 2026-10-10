"use client";

import { ChangeEvent, useId, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isSupportedImageUrl, normalizeGoogleDriveImageUrl } from "@/lib/image-url";

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
  const initialImageUrl = normalizeGoogleDriveImageUrl(initialUrl) ?? initialUrl;
  const [url, setUrl] = useState(initialImageUrl);
  const [imageLink, setImageLink] = useState(initialImageUrl);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function applyImageLink() {
    const value = imageLink.trim();
    if (!value) {
      setUrl("");
      setStatus("Tautan gambar dihapus. Simpan formulir untuk menerapkan perubahan.");
      return;
    }
    const normalizedUrl = normalizeGoogleDriveImageUrl(value);
    if (!normalizedUrl || !isSupportedImageUrl(normalizedUrl)) {
      setStatus("Masukkan tautan gambar HTTPS yang valid atau tautan file Google Drive.");
      return;
    }
    setUrl(normalizedUrl);
    setImageLink(normalizedUrl);
    setStatus("Tautan gambar siap disimpan.");
  }

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
      setImageLink(result.data.publicUrl);
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
      <label className="field-label" htmlFor={`${inputId}-url`}>Atau tautan gambar Google Drive
        <input
          id={`${inputId}-url`}
          type="url"
          value={imageLink}
          onChange={(event) => {
            setImageLink(event.target.value);
            setUrl(event.target.value);
            setStatus("");
          }}
          onBlur={applyImageLink}
          placeholder="https://drive.google.com/file/d/..."
          maxLength={2048}
        />
      </label>
      <span className="upload-hint">
        Untuk Google Drive, ubah akses file menjadi “Siapa saja yang memiliki link”, lalu tempel tautan berbagi.
      </span>
      <button className="button button-secondary" type="button" onClick={applyImageLink}>
        Gunakan tautan gambar
      </button>
      {url ? <a href={url} target="_blank" rel="noreferrer">Lihat foto yang tersimpan</a> : null}
      {status ? (
        <span
          className={status.includes("valid") ? "form-error" : "form-success"}
          role={status.includes("valid") ? "alert" : "status"}
        >
          {status}
        </span>
      ) : null}
    </div>
  );
}
