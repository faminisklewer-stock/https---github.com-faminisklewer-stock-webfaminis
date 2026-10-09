import Link from "next/link";
import { makeWhatsAppUrl } from "@/lib/format";

export function WhatsAppButton({
  number,
  message,
  label = "Hubungi Admin via WhatsApp",
  className = "",
}: {
  number: string | null | undefined;
  message: string;
  label?: string;
  className?: string;
}) {
  const href = makeWhatsAppUrl(number, message);
  if (!href) {
    return <p className={`contact-not-configured ${className}`.trim()}>Kontak WhatsApp Admin belum diatur.</p>;
  }
  return (
    <Link className={`button button-whatsapp ${className}`.trim()} href={href} target="_blank" rel="noreferrer">
      {label}
    </Link>
  );
}

export function FloatingWhatsAppButton({
  number,
  message,
}: {
  number: string | null | undefined;
  message: string;
}) {
  const href = makeWhatsAppUrl(number, message);
  if (!href) return null;

  return (
    <Link
      className="floating-whatsapp"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Hubungi Admin Faminis Barokah melalui WhatsApp"
      title="Chat dengan Admin"
    >
      <span>Tanya Admin</span>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 3.2A12.5 12.5 0 0 0 5.25 22.1L3.6 28.4l6.45-1.7A12.5 12.5 0 1 0 16 3.2Zm0 22.7a10.1 10.1 0 0 1-5.15-1.42l-.37-.22-3.83 1.01 1.02-3.73-.24-.38A10.15 10.15 0 1 1 16 25.9Zm5.57-7.6c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.8-1.69-2.1-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.25-.58-.5-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.58-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z"
        />
      </svg>
    </Link>
  );
}
