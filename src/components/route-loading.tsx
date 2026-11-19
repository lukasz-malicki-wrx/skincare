/** Shown the moment a navigation starts, while the next screen is still loading. */
export function RouteLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-8 w-40 motion-safe:animate-pulse rounded-full bg-line/70" />
      <div className="h-28 motion-safe:animate-pulse rounded-2xl bg-line/40" />
      <div className="h-28 motion-safe:animate-pulse rounded-2xl bg-line/40" />
    </div>
  );
}
