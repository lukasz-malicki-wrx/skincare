"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { pickOption, withSearchParam } from "@/lib/search-params";

/**
 * A view choice (tab, period) kept in the URL, so refresh, back and shared links keep it.
 * Unknown values fall back to the default; the default itself is not written to the URL.
 */
export function useSearchParamOption<T extends string>(key: string, options: readonly T[], fallback: T) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const value = pickOption(params.get(key), options, fallback);

  const setValue = useCallback(
    (next: T) => {
      router.replace(`${pathname}${withSearchParam(params.toString(), key, next, fallback)}`, { scroll: false });
    },
    [router, pathname, params, key, fallback],
  );

  return [value, setValue] as const;
}
