import Image from "next/image";

export function BrandSymbol({ className }: { className?: string }) {
  return (
    <Image
      src="/images/faminis-barokah-logo.png"
      alt=""
      width={244}
      height={384}
      className={`brand-symbol${className ? ` ${className}` : ""}`}
    />
  );
}
