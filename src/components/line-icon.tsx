import type { ReactNode, SVGProps } from "react";

/** A 24×24 outline icon drawn with `currentColor`, so its colour comes from the CSS around it. */
export function LineIcon({
  size,
  strokeWidth = 1.5,
  children,
  ...props
}: Readonly<{ size: number; strokeWidth?: number; children: ReactNode } & Omit<SVGProps<SVGSVGElement>, "width" | "height">>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}
