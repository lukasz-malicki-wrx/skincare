# Skincare AI – analiza techniczna MVP (PWA)

Stan: 2026-10-02. Punkt wyjścia: Next.js 16 skeleton + instalowalna PWA.

## 1. Co już jest w repo

| Element | Stan | Uwagi |
|---|---|---|
| Next.js 16.3.8, React 19, Tailwind 4, TS, pnpm 10 | OK | App Router, `src/app` |
| PWA manifest (`src/app/manifest.ts`) | OK | `scope`/`start_url` = `/aplikacja`, standalone, ikony 192/512/maskable |
| Service worker (`public/sw.js`) + rejestracja | szkielet | SW jest pusty (brak cache, brak push) |
| Ekrany `/aplikacja` (Zdjęcie), `/wynik`, `/profil` | placeholdery | Nawigacja w `src/config/navigation.ts` |
| Kamera, upload, AI, storage, push, cron | brak | do zrobienia |

Lokalnie: `pnpm install` zrobione. `tsc --noEmit` zgłasza brak `LayoutProps`. To typ generowany przez `next dev` / `next typegen` do `.next/types`, znika po pierwszym uruchomieniu. Nie jest to błąd kodu.

```bash
pnpm dev
```

## 2. Architektura docelowa (MVP)

```
[PWA: Next.js 16 na Vercel]
  /aplikacja          -> kamera (input capture / getUserMedia) -> kompresja -> POST /api/analyze
  /aplikacja/wynik    -> render wyniku (problemy, rutyna, produkty, flaga "idź do lekarza")
  /aplikacja/profil   -> alergie/wykluczenia, historia zdjęć, zgoda na push
  /api/analyze        -> Claude vision (obraz + profil) -> JSON (Zod structured output)
  /api/checkin        -> Claude: porównanie zdjęć przed/po, pytanie o postęp
  /api/push/subscribe -> zapis PushSubscription
  /api/cron/reminders -> Vercel Cron -> web-push (rutyna rano/wieczór, "jak idzie?")
[Storage]  Supabase (Postgres + Storage) albo Vercel Postgres/Blob; czyste demo: IndexedDB w przeglądarce
[AI]       @anthropic-ai/sdk, model claude-opus-5-5, structured outputs
```

Zasada MVP: core to `/api/analyze`. Push, cron i historia to warstwy dopinane po tym, jak core działa end-to-end.

## 3. Analiza twarzy AI

Model: Claude przez `@anthropic-ai/sdk`, `claude-opus-5-5`. Vision jest wbudowane, nie trzeba osobnego modelu CV. Obraz idzie jako blok `image` (base64 lub URL), odpowiedź wymuszona schematem Zod przez `client.messages.parse` + `zodOutputFormat`.

```bash
pnpm add @anthropic-ai/sdk zod
```

```ts
// src/lib/analyze-schema.ts
import { z } from "zod";
export const SkinAnalysis = z.object({
  photo_quality: z.object({ ok: z.boolean(), issue: z.string().nullable() }),
  skin_type: z.enum(["normal", "dry", "oily", "combination", "sensitive"]),
  findings: z.array(z.object({
    name: z.string(),        // "trądzik łagodny", "zaskórniki", "rumień"
    area: z.string(),        // "czoło", "policzki"
    severity: z.enum(["low", "medium", "high"]),
    confidence: z.number().min(0).max(1),
  })),
  see_a_doctor: z.boolean(), // red flag -> dermatolog, nie kosmetyki
  routine: z.object({
    morning: z.array(z.object({ step: z.string(), ingredient: z.string(), why: z.string() })),
    evening: z.array(z.object({ step: z.string(), ingredient: z.string(), why: z.string() })),
  }),
  avoid_ingredients: z.array(z.string()),
  product_queries: z.array(z.string()), // składniki/kategorie, nie marki
  followup_days: z.number(),
});
```

```ts
// src/app/api/analyze/route.ts (szkic)
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { SkinAnalysis } from "@/lib/analyze-schema";

export const maxDuration = 60;
const client = new Anthropic(); // ANTHROPIC_API_KEY z env

export async function POST(req: Request) {
  const { imageBase64, mediaType, profile } = await req.json();
  const res = await client.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "high", format: zodOutputFormat(SkinAnalysis) },
    system: SYSTEM_PROMPT, // kosmetolog-asystent, PL, kontekst pielęgnacyjny, zawsze disclaimer
    messages: [{ role: "user", content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
      { type: "text", text: `Profil: ${JSON.stringify(profile)}. Oceń skórę i zaproponuj rutynę.` },
    ]}],
  });
  if (res.stop_reason === "refusal") return Response.json({ error: "refused" }, { status: 422 });
  return Response.json(res.parsed_output);
}
```

Uwagi:

- Rozmiar obrazu: kompresja po stronie klienta (canvas do JPEG, dłuższy bok ok. 1568 px, jakość ok. 0.8). Mniej tokenów, szybciej, mieści się w limicie body Vercel (4.5 MB).
- Czas odpowiedzi: 10–30 s. UI potrzebuje stanu "analizuję", opcjonalnie streaming tekstu.
- Thinking na Opus 5.5 jest zawsze włączony. Sterujesz `output_config.effort`, default to `medium`, dla analizy daj `high`.
- Fallbacks: `fallbacks: "default"` sprawia, że jeśli klasyfikator odrzuci zapytanie (zdjęcie zmian skórnych może trafić w kategorię medyczną), serwer przekieruje na inny model zamiast zwracać refusal. Do wyłączenia, jeśli nie chcesz.
- `photo_quality` pozwala odesłać usera po lepsze zdjęcie zamiast zgadywać wynik.
- Check-in przed/po: dwa obrazy w jednym request + poprzedni JSON. Schemat z polem `progress: improved | same | worse` i komentarzem.
- Prompt caching: `SYSTEM_PROMPT` i schemat są stałe, więc `cache_control: { type: "ephemeral" }` na system. Obraz jest zawsze inny, cache działa tylko na prefix.
- Produkty: nie proś modelu o konkretne marki (halucynacje). Model zwraca składniki i kategorie w `product_queries`, Ty mapujesz na własną małą bazę JSON (20–50 produktów) albo link do wyszukiwarki apteki.

## 4. PWA – co dopisać

1. Kamera. `<input type="file" accept="image/*" capture="user">` działa wszędzie, także iOS, i otwiera natywny aparat. `getUserMedia` daje live preview z owalem na twarz, ale wymaga HTTPS i więcej kodu. Na MVP: `input capture`, potem ewentualnie upgrade.
2. Service worker. Obecny handler `fetch` jest pusty. Dla demo: precache ikon i shella (`/aplikacja`), network-first dla reszty, bez cache dla `/api/*`. Alternatywa: `@serwist/next` (następca next-pwa, Workbox). Ręczny `sw.js` jest OK i ma mniej magii.
3. Push. Web Push API + paczka `web-push` (VAPID). Flow: `Notification.requestPermission()`, potem `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`, POST subskrypcji do backendu, cron wysyła. W `sw.js` dopisz handlery `push` i `notificationclick`.
   - iOS: push działa tylko po dodaniu PWA do ekranu głównego (iOS 16.4+). W karcie Safari nie zadziała. Potrzebny ekran "Dodaj do ekranu głównego".
   - Android i Chrome desktop: działa od razu.
4. Harmonogram. Vercel Cron w `vercel.json`: `crons: [{ path: "/api/cron/reminders", schedule: "0 7,20 * * *" }]`. Endpoint sprawdza komu wysłać (strefa czasowa z profilu) i strzela web-push. Zabezpiecz nagłówkiem z `CRON_SECRET`.
5. Offline: nie priorytet. Shell offline + komunikat "analiza wymaga sieci".
6. Instalowalność: manifest już spełnia wymagania Chrome. Brakuje tylko SW z realnym `fetch` handlerem.

## 5. Storage i tożsamość

| Opcja | Plusy | Minusy |
|---|---|---|
| A. Tylko klient (IndexedDB przez `idb-keyval`, zdjęcia jako Blob) | zero backendu, demo działa po URL od razu | brak push z serwera (nie ma listy userów), brak historii między urządzeniami |
| B. Anonimowy ID (cookie + `crypto.randomUUID`) + Supabase lub Vercel Postgres/Blob | push i cron działają, historia, porównania | trzeba postawić DB (ok. 15 min), trzymasz zdjęcia skóry, więc auto-usuwanie po X dniach |
| C. Pełny auth (Supabase Auth / Clerk) | prawdziwa appka | zbędne na MVP |

Rekomendacja: B z anonimowym ID. Push wymaga serwera, a "appka pyta jak idzie" to wyróżnik. Zdjęcia w prywatnym buckecie, signed URL, auto-delete po 30 dniach.

## 6. Deploy po URL

- Vercel, zero konfiguracji dla Next.js 16. Env: `ANTHROPIC_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `CRON_SECRET`, `DATABASE_URL`. HTTPS z automatu, wymagany do kamery, SW i push.
- Każdy PR daje preview URL, testy na telefonach przez QR.
- Lokalnie z telefonu: `localhost` nie jest HTTPS poza laptopem. Użyj `next dev --experimental-https` albo tunelu:

```bash
cloudflared tunnel --url http://localhost:3000
```

## 7. Ryzyka i ograniczenia

- iOS Safari: push tylko po instalacji PWA, `getUserMedia` wymaga gestu usera, brak `beforeinstallprompt` (instrukcja ręczna "Udostępnij, Do ekranu początkowego").
- Refusal: zdjęcia zmian skórnych mogą być klasyfikowane jako medyczne. Prompt ma jasno ustawiać kontekst pielęgnacyjny, `see_a_doctor` jest bezpiecznikiem, fallbacks ograniczają odrzucenia.
- Koszt: jedno zdjęcie to ok. 1500 tokenów obrazu, cała analiza ok. 3–5k tokenów, czyli kilka centów na Opus 5.5. Przy skali MVP bez znaczenia.
- Latencja 10–30 s: skeleton, progres, streaming.
- Payload: limit 4.5 MB na funkcję Vercel. Kompresja po stronie klienta jest obowiązkowa, albo upload bezpośrednio do Storage i przekazanie URL.
- Next.js 16: `AGENTS.md` ostrzega, że API różni się od starszych wersji. Przed pisaniem kodu czytaj `node_modules/next/dist/docs/`.
- Zgody: zdjęcia twarzy to dane wrażliwe. Na demo checkbox zgody + auto-usuwanie, bez publikowania realnych zdjęć testowych.

## 8. Kolejność prac

1. `/api/analyze` + schemat Zod + test curl z przykładowym zdjęciem (core, 2–3 h).
2. Ekran Zdjęcie: `input capture`, kompresja, wywołanie API, zapis wyniku w IndexedDB, redirect na Wynik.
3. Ekran Wynik: render JSON (findings, rutyna rano/wieczór, avoid, produkty z lokalnej bazy, disclaimer).
4. Profil: alergie i wykluczenia przekazywane do promptu.
5. Deploy na Vercel, test na telefonach.
6. Push: VAPID, subscribe, handler w `sw.js`, ręczny endpoint "wyślij przypomnienie" do demo bez czekania na cron.
7. Cron + check-in: porównanie dwóch zdjęć, raport postępu.
8. SW cache shella, dopieszczenie instalacji.

Punkty 1–5 to działające demo. Punkty 6–8 to wyróżniki.
