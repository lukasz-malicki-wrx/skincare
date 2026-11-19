"use client";

import { memo, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A chip that is a real `radio` (pick one) or `checkbox` (pick many) input inside its label, so
 * the browser provides the semantics, keyboard (arrows within a radio group, Space) and form
 * behaviour. Group chips in a `<fieldset>` with a `<legend>`. Memoised: pass a stable `onChange`.
 */
const SIZES = {
  sm: "px-3 py-1.5",
  md: "px-5 py-3 text-center font-medium",
} as const;

export const ChoiceChip = memo(function ChoiceChip({
  size = "sm",
  type,
  name,
  value,
  checked,
  onChange,
  children,
}: Readonly<{
  /** `sm` for tag-like chips, `md` for a row of button-sized options. */
  size?: keyof typeof SIZES;
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}>) {
  return (
    <label
      className={cn(
        "cursor-pointer rounded-full border text-sm",
        SIZES[size],
        "focus-ring-within",
        checked ? "border-accent bg-accent text-paper" : "border-line",
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {children}
    </label>
  );
});
