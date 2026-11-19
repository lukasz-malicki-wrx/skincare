import { cn } from "@/lib/cn";

export function SlideDots({ index, total }: { index: number; total: number }) {
  return (
    <ol className="flex gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        // One dot per slide position; the position is the dot's identity.
        <li key={i} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-accent" : "w-1.5 bg-line")} />
      ))}
    </ol>
  );
}
