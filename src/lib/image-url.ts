export function normalizeGoogleDriveImageUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }

  if (url.hostname !== "drive.google.com") return value;
  if (url.protocol !== "https:") return null;

  const filePathMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
  const fileId = filePathMatch?.[1] ?? url.searchParams.get("id");
  if (!fileId || !/^[a-zA-Z0-9_-]{1,200}$/.test(fileId)) return null;

  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w2000`;
}

export function isSupportedImageUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (url.hostname === "drive.google.com") {
    return url.pathname === "/thumbnail" && Boolean(url.searchParams.get("id"));
  }
  return url.hostname.endsWith(".supabase.co")
    && url.pathname.startsWith("/storage/v1/object/public/");
}
