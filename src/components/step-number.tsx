/** The round number in front of a routine step. */
export function StepNumber({ children }: { children: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-peach-light text-sm font-medium">
      {children}
    </span>
  );
}
