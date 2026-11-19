// One-off: builds src/data/catalog.json with real products from Polish shops.
// Run: node scripts/build-catalog.mjs   (needs ANTHROPIC_API_KEY in .env.local; costs ~0.6 USD)
import fs from "node:fs";
import { createRequire } from "node:module";
import { SHOP_DOMAINS, isProductPageAlive, looksLikeProductPage, normalizeUrl } from "../src/lib/product-page.ts";

const require = createRequire(import.meta.url);
const Anthropic = require("@anthropic-ai/sdk").default;
const { betaZodOutputFormat } = require("@anthropic-ai/sdk/helpers/beta/zod");
const { z } = require("zod");

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const key = env.match(/^ANTHROPIC_API_KEY=(.+)$/m)?.[1]?.trim();
if (!key) throw new Error("ANTHROPIC_API_KEY missing in .env.local");
const client = new Anthropic({ apiKey: key });

const CATEGORIES = [
  { id: "cleanser", label: "Cleanser", query: "żel oczyszczający do twarzy" },
  { id: "toner", label: "Toner / exfoliant", query: "tonik złuszczający do twarzy kwasy" },
  { id: "serum", label: "Serum", query: "serum do twarzy niacynamid" },
  { id: "moisturizer", label: "Moisturizer", query: "krem nawilżający do twarzy na dzień" },
  { id: "spf", label: "SPF", query: "krem z filtrem SPF 50 do twarzy" },
  { id: "night", label: "Night cream", query: "krem na noc do twarzy" },
];
const SKIN_GROUPS = [
  { skin: ["oily", "combination"], hint: "do cery tłustej i mieszanej" },
  { skin: ["dry", "sensitive", "normal"], hint: "do cery suchej i wrażliwej" },
];

const Item = z.object({
  name: z.string(),
  brand: z.string(),
  url: z.string(),
  shop: z.string(),
  price_pln: z.number().nullable(),
  skin_types: z.array(z.enum(["normal", "dry", "oily", "combination", "sensitive"])).min(1),
  key_ingredients: z.array(z.string()).min(1).max(4),
  how_to: z.string().describe("1-2 sentences in English on how to apply"),
  watch_out: z.string().nullable().describe("One sentence in English on what not to combine it with, or null"),
  why: z.string().describe("One sentence in English on who it is for"),
});
const Out = z.object({ products: z.array(Item).max(4) });

const SYSTEM = `You build a skincare product catalogue for an app sold in Poland. The search is limited to Polish shops. Write queries in Polish. Return up to 4 different products (different brands) that you actually found, each with the product page url copied exactly from the search results (no category, search or blog pages, no sets). Prefer a spread of prices from cheap to mid-range. Ingredients, how_to and watch_out must come from the product page text, in English.`;

const OUT = new URL("../src/data/catalog.json", import.meta.url);
const ONLY = process.env.ONLY?.split(",").filter(Boolean);
const catalog = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : [];
const ALT_QUERY = { toner: "tonik do twarzy nawilżający bez alkoholu", spf: "krem SPF 50 do twarzy lekki", night: "krem regenerujący na noc ceramidy niacynamid", cleanser: "pianka do mycia twarzy", serum: "serum do twarzy kwas hialuronowy", moisturizer: "krem do twarzy nawilżający lekki" };
for (const c of CATEGORIES.filter((c) => !ONLY || ONLY.includes(c.id))) {
  for (const g of SKIN_GROUPS) {
    const q = `${ONLY ? ALT_QUERY[c.id] : c.query} ${g.hint}`;
    process.stdout.write(`${c.id} / ${g.skin.join(",")} ... `);
    try {
      const res = await client.beta.messages.parse({
        model: "claude-haiku-4-5", max_tokens: 6000,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2, user_location: { type: "approximate", country: "PL" }, allowed_domains: [...SHOP_DOMAINS] }],
        output_config: { format: betaZodOutputFormat(Out) },
        system: SYSTEM,
        messages: [{ role: "user", content: `Category: ${c.label}. Search: "${q}". Target skin: ${g.skin.join(", ")}.` }],
      });
      const urls = new Set();
      for (const b of res.content) if (b.type === "web_search_tool_result" && Array.isArray(b.content)) for (const r of b.content) urls.add(normalizeUrl(r.url));
      let kept = 0;
      for (const p of res.parsed_output?.products ?? []) {
        if (!urls.has(normalizeUrl(p.url)) || !looksLikeProductPage(p.url)) continue;
        if (!(await isProductPageAlive(p.url))) continue;
        if (catalog.some((x) => normalizeUrl(x.url) === normalizeUrl(p.url))) continue;
        catalog.push({ id: `${c.id}-${catalog.length + 1}`, category: c.id, ...p });
        kept++;
      }
      console.log(`kept ${kept}`);
    } catch (e) { console.log("ERROR", e.message?.slice(0, 120)); }
  }
}
fs.mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2) + "\n");
console.log("total products:", catalog.length, "by category:", Object.fromEntries(CATEGORIES.map((c) => [c.id, catalog.filter((p) => p.category === c.id).length])));
