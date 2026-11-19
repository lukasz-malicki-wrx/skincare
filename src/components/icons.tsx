import type { SVGProps } from "react";
import { LineIcon } from "@/components/line-icon";

/** Shared outline icons. Decorative (`aria-hidden`); the control around them carries the label. */
type IconProps = { size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, "width" | "height" | "children" | "strokeWidth">;

export function CloseIcon({ size = 16, strokeWidth = 2, ...props }: IconProps) {
  return (
    <LineIcon size={size} strokeWidth={strokeWidth} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </LineIcon>
  );
}

export function ArrowIcon({ size = 18, strokeWidth = 2, ...props }: IconProps) {
  return (
    <LineIcon size={size} strokeWidth={strokeWidth} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </LineIcon>
  );
}

export function LockIcon({ size = 20, strokeWidth = 2, ...props }: IconProps) {
  return (
    <LineIcon size={size} strokeWidth={strokeWidth} strokeLinecap="round" {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </LineIcon>
  );
}

export function CameraIcon({ size = 20, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <LineIcon size={size} strokeWidth={strokeWidth} {...props}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </LineIcon>
  );
}

export function MoonIcon({ size = 20, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <LineIcon size={size} strokeWidth={strokeWidth} {...props}>
      <path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z" />
      <path d="M17.5 2.5c.3 1.7.9 2.3 2.5 2.5-1.6.2-2.2.8-2.5 2.5-.3-1.7-.9-2.3-2.5-2.5 1.6-.2 2.2-.8 2.5-2.5z" />
    </LineIcon>
  );
}

export function ScanIcon({ size = 20, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <LineIcon size={size} strokeWidth={strokeWidth} {...props}>
      <path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3" />
      <path d="M7 8v8M10 8v8M12.5 8v8M16 8v8" />
    </LineIcon>
  );
}

export function SparkIcon({ size = 20, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <LineIcon size={size} strokeWidth={strokeWidth} {...props}>
      <path d="M10 6c.9 4.6 1.8 5.5 6.5 6.5-4.7 1-5.6 1.9-6.5 6.5-.9-4.6-1.8-5.5-6.5-6.5 4.7-1 5.6-1.9 6.5-6.5z" />
      <path d="M18 2.5c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3z" />
    </LineIcon>
  );
}

export function TrendIcon({ size = 20, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <LineIcon size={size} strokeWidth={strokeWidth} {...props}>
      <path d="M3 20h18" />
      <path d="M4 16l5-5 4 3 7-7" />
      <path d="M15 7h5v5" />
    </LineIcon>
  );
}
