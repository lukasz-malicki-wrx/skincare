import Image from "next/image";
import { brand } from "@/config/brand";

/** Kafelek loga z Figmy (gradient apricot → clay). */
export function BrandMark({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src={brand.assets.logoMark}
      alt=""
      width={size}
      height={size}
      priority
      className={`shrink-0 rounded-[20%] ${className}`}
    />
  );
}
