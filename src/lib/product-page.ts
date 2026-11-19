const TIMEOUT_MS = 4000;

/** Shops the product search is limited to (web_search `allowed_domains`). */
export const SHOP_DOMAINS = [
  "hebe.pl",
  "rossmann.pl",
  "notino.pl",
  "doz.pl",
  "superpharm.pl",
  "douglas.pl",
  "sephora.pl",
  "drogerianatura.pl",
  "allegro.pl",
  "ceneo.pl",
] as const;

/**
 * What a single product page looks like in each shop. Search results also return category,
 * search and blog pages, and the model happily picks those; anything not matching is dropped.
 */
const PRODUCT_PATH: Record<string, RegExp> = {
  "hebe.pl": /\.html$/,
  "rossmann.pl": /^\/Produkt\//,
  "doz.pl": /^\/apteka\/p\d+/,
  "superpharm.pl": /^(?!\/blog\/).*-\d+$/,
  "notino.pl": /\/p-\d+\/?$/,
  "allegro.pl": /^\/oferta\//,
  "ceneo.pl": /^\/\d+$/,
  "douglas.pl": /\/p\//,
  "sephora.pl": /\/p\//,
  "drogerianatura.pl": /\/p\//,
};

export function looksLikeProductPage(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const pattern = PRODUCT_PATH[host];
  return pattern ? pattern.test(parsed.pathname) : false;
}

/** Same page regardless of percent-encoding, case, trailing slash or query string. */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = decodeURIComponent(u.pathname).replace(/\/+$/, "");
    return `${u.hostname.replace(/^www\./, "")}${path}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * Last line of defence for a link: a GET that returns 404/410 means the page is gone.
 * Bot walls (403, "Just a moment") and timeouts tell us nothing, so those pass.
 */
export async function isProductPageAlive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36",
        accept: "text/html",
      },
    });
    res.body?.cancel().catch(() => {});
    return res.status !== 404 && res.status !== 410;
  } catch {
    return true;
  }
}
