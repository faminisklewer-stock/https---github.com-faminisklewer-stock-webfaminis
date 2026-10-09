"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteChrome({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <div className="admin-area">{children}</div>;
  }

  return (
    <>
      <a className="skip-link" href="#konten-utama">Lewati ke konten</a>
      {header}
      <main id="konten-utama">{children}</main>
      {footer}
    </>
  );
}
