"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

const STYLES = {
  segmented: {
    list: "flex gap-1 rounded-full bg-brand-peach-light/40 p-1",
    tab: "flex-1 rounded-full py-2 text-sm font-medium",
    active: "bg-paper shadow-sm",
    idle: "text-ink/70",
  },
  pills: {
    list: "flex gap-2",
    tab: "rounded-full border px-4 py-1.5 text-sm",
    active: "border-accent bg-accent text-paper",
    idle: "border-line",
  },
} as const;

const NEXT_KEYS: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
};

export type TabOption<T extends string> = { value: T; label: string };

const tabId = (id: string, value: string) => `${id}-tab-${value}`;
const panelId = (id: string) => `${id}-panel`;

/**
 * WAI-ARIA tabs with automatic activation: arrow keys, Home and End move the selection, and only
 * the selected tab is in the tab order. Pair with `TabPanel` using the same `id` (from `useId`).
 */
export function Tabs<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  variant = "segmented",
}: Readonly<{
  id: string;
  label: string;
  options: readonly TabOption<T>[];
  value: T;
  onChange: (next: T) => void;
  variant?: keyof typeof STYLES;
}>) {
  const styles = STYLES[variant];

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const move = NEXT_KEYS[e.key];
    if (!move) return;
    e.preventDefault();
    const current = options.findIndex((o) => o.value === value);
    const next = options[move(current, options.length)].value;
    onChange(next);
    document.getElementById(tabId(id, next))?.focus();
  }

  return (
    <div role="tablist" aria-label={label} className={styles.list}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            id={tabId(id, option.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={onKeyDown}
            className={cn(styles.tab, selected ? styles.active : styles.idle)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, value, children }: Readonly<{ id: string; value: string; children: ReactNode }>) {
  return (
    <div role="tabpanel" id={panelId(id)} aria-labelledby={tabId(id, value)} className="flex flex-col gap-5">
      {children}
    </div>
  );
}
