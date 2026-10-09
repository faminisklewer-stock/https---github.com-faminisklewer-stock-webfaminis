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
