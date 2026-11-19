import assert from "node:assert/strict";
import { test } from "node:test";
import { looksLikeProductPage, normalizeUrl } from "./product-page.ts";

const PRODUCT_PAGES = [
  "https://www.hebe.pl/cerave-oczyszczajacy-zel-236-ml-000000000000459442.html",
  "https://www.rossmann.pl/Produkt/Zele-i-pianki/NIVEA-zel-do-mycia-twarzy-150-ml,30004,8690",
  "https://www.doz.pl/apteka/p120861-Nivea_zel_do_mycia_twarzy_150_ml",
  "https://www.superpharm.pl/cerave-nawilzajacy-krem-do-twarzy-spf50-162515",
  "https://www.notino.pl/cerave/oczyszczajacy-zel-do-mycia/p-15734040/",
  "https://allegro.pl/oferta/krem-nawilzajacy-spf-50-17550632040",
  "https://www.ceneo.pl/146538656",
];

const OTHER_PAGES = [
  "https://www.hebe.pl/oczyszczanie-zele-do-mycia-twarzy-1/",
  "https://www.rossmann.pl/szukaj?Search=zel",
  "https://www.rossmann.pl/kategoria/kremy-do-twarzy,13049?Page=28",
  "https://www.doz.pl/k/kremy-z-filtrem-spf-50-5919",
  "https://www.superpharm.pl/blog/kosmetyki-do-cery-mieszanej-polecane-przez-kosmetologa-12",
  "https://www.notino.pl/pielegnacja-cery-mieszanej/",
  "https://allegro.pl/listing?string=cerave+zel",
  "https://www.ceneo.pl/Kremy_do_twarzy/Rodzaj_skory:Mieszana.htm",
  "https://skinsort.com/products/anything",
  "not a url",
];

test("REQ-AI-03 looksLikeProductPage accepts product pages of the allowed shops", () => {
  for (const url of PRODUCT_PAGES) assert.equal(looksLikeProductPage(url), true, url);
});

test("REQ-AI-03 looksLikeProductPage rejects category, search, blog and unknown pages", () => {
  for (const url of OTHER_PAGES) assert.equal(looksLikeProductPage(url), false, url);
});

test("normalizeUrl ignores encoding, case, www, trailing slash and query", () => {
  assert.equal(
    normalizeUrl("https://www.notino.pl/cerave/krem-oczyszczaj%C4%85cy/p-1/?utm=x"),
    normalizeUrl("https://notino.pl/CeraVe/krem-oczyszczający/p-1"),
  );
});
