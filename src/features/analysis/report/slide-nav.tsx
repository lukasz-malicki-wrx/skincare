"use client";

import { Button, ButtonLink } from "@/components/button";
import { SlideDots } from "@/features/analysis/report/slide-dots";
import { useMessages } from "@/i18n/locale-provider";

/** Back, dots and Next (or the exit link on the last slide), stuck to the bottom of the report. */
export function SlideNav({
  index,
  total,
  exit,
  onGoTo,
}: Readonly<{
  index: number;
  total: number;
  exit: { href: string; label: string };
  onGoTo: (index: number) => void;
}>) {
  const t = useMessages().result;
  return (
    <nav
      aria-label={t.sections}
      className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-paper px-5 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
    >
      <Button variant="ghost" size="sm" onClick={() => onGoTo(index - 1)} disabled={index === 0}>
        {t.back}
      </Button>
      <SlideDots index={index} total={total} />
      {index === total - 1 ? (
        <ButtonLink href={exit.href}>{exit.label}</ButtonLink>
      ) : (
        <Button onClick={() => onGoTo(index + 1)}>{t.next}</Button>
      )}
    </nav>
  );
}
