export type ContactPlatform =
  | "Google Maps"
  | "Shopee"
  | "TikTok"
  | "Instagram"
  | "Facebook"
  | "WhatsApp"
  | "Telepon"
  | "Email";

export function ContactPlatformIcon({ platform }: { platform: ContactPlatform }) {
  if (platform === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="instagram-mark" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEDA75" />
            <stop offset=".5" stopColor="#D62976" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instagram-mark)" />
        <rect x="6.5" y="6.5" width="11" height="11" rx="3.2" fill="none" stroke="white" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.7" fill="none" stroke="white" strokeWidth="1.8" />
        <circle cx="17.1" cy="6.9" r="1.1" fill="white" />
      </svg>
    );
  }
  if (platform === "TikTok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.1 3h3.1c.2 2.1 1.3 3.4 3.4 3.8v3.1a8.2 8.2 0 0 1-3.4-1.1v5.4a5.8 5.8 0 1 1-5.8-5.8c.4 0 .8 0 1.2.1v3.2a2.7 2.7 0 1 0 1.5 2.4V3Z" fill="#25F4EE" transform="translate(-1 .4)" />
        <path d="M13.1 3h3.1c.2 2.1 1.3 3.4 3.4 3.8v3.1a8.2 8.2 0 0 1-3.4-1.1v5.4a5.8 5.8 0 1 1-5.8-5.8c.4 0 .8 0 1.2.1v3.2a2.7 2.7 0 1 0 1.5 2.4V3Z" fill="#FE2C55" transform="translate(1 -.3)" />
        <path d="M13.1 3h3.1c.2 2.1 1.3 3.4 3.4 3.8v3.1a8.2 8.2 0 0 1-3.4-1.1v5.4a5.8 5.8 0 1 1-5.8-5.8c.4 0 .8 0 1.2.1v3.2a2.7 2.7 0 1 0 1.5 2.4V3Z" fill="#161616" />
      </svg>
    );
  }
  if (platform === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#0866FF" />
        <path fill="white" d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.2v3.1H10v8h3.4Z" />
      </svg>
    );
  }
  if (platform === "Google Maps") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#34A853" d="M12 22c-1.4-2.2-7.2-8.3-7.2-13.1A7.2 7.2 0 0 1 12 1.7c2 0 3.7.8 5 2.1L8.9 18.3 12 22Z" />
        <path fill="#4285F4" d="M12 22c1.7-2.6 7.2-8.4 7.2-13.1 0-2-.8-3.8-2.2-5.1L8.9 18.3 12 22Z" />
        <path fill="#FBBC04" d="M4.8 8.9c0-2 .8-3.8 2.2-5.1l4.9 5-3 9.5c-1.8-2.8-4.1-6.4-4.1-9.4Z" />
        <path fill="#EA4335" d="M7 3.8a7.2 7.2 0 0 1 10 0l-5 5-5-5Z" />
        <circle cx="12" cy="8.8" r="2.4" fill="white" />
        <circle cx="12" cy="8.8" r="1.2" fill="#4285F4" />
      </svg>
    );
  }
  if (platform === "Shopee") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EE4D2D" d="M5 8h14l1 13H4L5 8Z" />
        <path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="#EE4D2D" strokeWidth="1.6" />
        <path d="M14.5 13.1c-.4-.5-1-.8-1.8-.8-.8 0-1.3.3-1.3.8 0 1.5 4.2.5 4.2 3.4 0 1.4-1.3 2.3-3.1 2.3-1.4 0-2.5-.5-3.2-1.5l1.2-1.1c.5.7 1.2 1 2.1 1 .8 0 1.3-.3 1.3-.8 0-1.4-4.2-.5-4.2-3.4 0-1.4 1.2-2.3 3-2.3 1.3 0 2.3.4 3 1.3l-1.2 1.1Z" fill="white" />
      </svg>
    );
  }
  if (platform === "WhatsApp") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path fill="#168B4B" d="M16 3.2A12.5 12.5 0 0 0 5.25 22.1L3.6 28.4l6.45-1.7A12.5 12.5 0 1 0 16 3.2Zm0 22.7a10.1 10.1 0 0 1-5.15-1.42l-.37-.22-3.83 1.01 1.02-3.73-.24-.38A10.15 10.15 0 1 1 16 25.9Zm5.57-7.6c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.8-1.69-2.1-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.25-.58-.5-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.58-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
      </svg>
    );
  }
  if (platform === "Telepon") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7.1 3.8 2.6 4.5-1.9 1.8a15.4 15.4 0 0 0 6.1 6.1l1.8-1.9 4.5 2.6-.8 3a2 2 0 0 1-2.1 1.5A17.4 17.4 0 0 1 2.9 5.2a2 2 0 0 1 1.5-2.1l2.7.7Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3V5Zm1.4 1.5 7.6 6 7.6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
