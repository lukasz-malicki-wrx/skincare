# Integracja AI "any model" – brief techniczny

Stan: 2026-10-02. Dotyczy `src/app/api/analyze/route.ts` (dziś tylko Claude przez `@anthropic-ai/sdk`) i schematu `src/lib/skin-analysis.ts` (Zod 4). Wersje paczek sprawdzone w rejestrze npm, model id z oficjalnych docs providerów.

## Rekomendacja

Przejść na **Vercel AI SDK 7** (`ai@7.0.x` + `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`, `@openrouter/ai-sdk-provider`). Jedno wywołanie `generateText({ model, output: Output.object({ schema: SkinAnalysis }), messages })` działa z tym samym schematem Zod i tym samym blokiem obrazu dla każdego providera; zmiana modelu to zmiana dwóch zmiennych env (`AI_PROVIDER`, `AI_MODEL`). Tracimy niewiele względem obecnego kodu: `effort`, adaptive thinking, `cacheControl` i `fallbacks: "default"` są dostępne przez `providerOptions.anthropic`, a cache tokens przez `usage.inputTokenDetails`. Bezpośrednie SDK per provider zostawiamy jako plan B (gdyby AI SDK nie obsłużył jakiejś opcji), OpenRouter dopinamy jako czwarty provider w tej samej warstwie, nie jako osobną ścieżkę.

## Porównanie opcji

| Opcja | Plusy | Minusy | Koszt zmiany modelu |
|---|---|---|---|
| **A. Vercel AI SDK 7** (`ai`, `@ai-sdk/*`) | jeden interfejs, Zod 3.25+/4 natywnie, obraz jako `{ type: "file", mediaType: "image/jpeg", data }` u każdego providera, `Output.object` dla structured output, `providerOptions` dla opcji specyficznych (Anthropic: `effort`, `thinking`, `cacheControl`, `fallbacks`, `structuredOutputMode`) | ESM-only, wymaga Node 22+; abstrakcja czasem opóźniona względem nowych feature'ów providera; `generateObject` nadal istnieje, ale docs kierują na `generateText` + `output` | env var |
| **B. SDK per provider** (`@anthropic-ai/sdk` 0.131 + `openai` 7.27 + `@google/genai` 2.26) | pełny dostęp do każdego API od razu (np. `client.beta.messages.parse` + `betaZodOutputFormat` już działa) | trzy różne kształty obrazu, trzy sposoby na structured output (Anthropic `output_config.format`, OpenAI `response_format`/`zodResponseFormat`, Gemini `responseJsonSchema`), trzy obsługi błędów; własny adapter do napisania i utrzymania | nowy adapter na provider (~100 linii każdy) |
| **C. OpenRouter** jako jedyny endpoint (OpenAI-compatible, `baseURL=https://openrouter.ai/api/v1`) | jeden klucz, ~300 modeli, id `provider/model`, obraz przez `image_url` (base64 data URL), `response_format: json_schema` | structured output zależy od modelu *i* upstream providera (ten sam model może nie wspierać u części providerów); traci się opcje natywne (effort, fallbacks Anthropic); dodatkowa marża i hop; klucz OpenRouter zamiast kluczy własnych | string modelu |
| **A + C** (rekomendowane) | OpenRouter jako czwarty provider w AI SDK: `@openrouter/ai-sdk-provider@3.1.0` (peer `ai@^7`) | jak wyżej dla C, ale tylko wtedy, gdy ktoś go włączy | env var |

Co sprawdzono w docs AI SDK: Anthropic provider ma w tabeli `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-4-5` z image input + object generation; dla Opus 5.5 / Sonnet 5.5 tryb `jsonTool` automatycznie przechodzi na `outputFormat` (forced tool use jest odrzucany). Google provider wymienia `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-pro-preview`; OpenAI provider domyślnie używa Responses API i wymienia `gpt-6-astra`, `gpt-6-luna`, `gpt-6-sol`, `gpt-5.6`, `gpt-5`, `gpt-5-mini`.

## Proponowana architektura

```
src/lib/ai/
  provider.ts      # getModel(): LanguageModel na podstawie AI_PROVIDER/AI_MODEL; mapowanie env -> createAnthropic/createOpenAI/createGoogleGenerativeAI/createOpenRouter
  analyze.ts       # analyzeSkin({ imageBase64, mediaType, profile }): Promise<SkinAnalysis>
                   # generateText + Output.object({ schema: SkinAnalysis }) + providerOptions per provider
  prompt.ts        # SYSTEM_PROMPT (przeniesiony z route.ts) + budowanie wiadomości usera
  errors.ts        # mapowanie błędów AI SDK (APICallError, NoObjectGeneratedError, refusal) na kody HTTP 422/429/502
src/lib/skin-analysis.ts   # bez zmian (schemat Zod 4 jest kompatybilny z ai@7)
src/app/api/analyze/route.ts  # chudnie: walidacja body -> analyzeSkin() -> Response.json; maxDuration zostaje
.env.example                  # nowe zmienne, patrz niżej
package.json                  # + ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google @openrouter/ai-sdk-provider; @anthropic-ai/sdk można usunąć po migracji
```

Zmienne env:

```
AI_PROVIDER=anthropic          # anthropic | openai | google | openrouter
AI_MODEL=claude-opus-5-5       # id modelu w notacji danego providera; puste = domyślny dla providera
ANTHROPIC_API_KEY=             # czytany automatycznie przez @ai-sdk/anthropic
OPENAI_API_KEY=                # @ai-sdk/openai
GOOGLE_GENERATIVE_AI_API_KEY=  # @ai-sdk/google
OPENROUTER_API_KEY=            # @openrouter/ai-sdk-provider
```

Szczegóły, które przenosimy z obecnego route.ts jako `providerOptions.anthropic`: `effort: "high"`, `thinking: { type: "adaptive" }`, `fallbacks: "default"`, `cacheControl: { type: "ephemeral" }` na bloku system. Dla innych providerów `providerOptions` zostaje puste; `refusal` sprawdzamy przez `result.finishReason`/`providerMetadata`. Obraz: `{ type: "file", mediaType, data: imageBase64 }` (AI SDK 7 zdeprecjonował `type: "image"`).

## Modele do przetestowania

| Provider | Model id | Uwagi |
|---|---|---|
| Anthropic | `claude-opus-5-5` | obecny default; $4/$20 per MTok; thinking zawsze włączone, sterujemy `effort` (default `medium`, dajemy `high`) |
| Anthropic | `claude-sonnet-5-5` | $2/$10; szybszy, do porównania jakości na tych samych zdjęciach |
| Anthropic | `claude-haiku-4-5` | $1/$5; najtańszy z vision, 200K ctx; `thinking` przez `budget_tokens`, nie `adaptive` |
| OpenAI | `gpt-6-astra` | flagowy, $10/$50 (docs OpenAI); vision + structured outputs (Responses API) |
| OpenAI | `gpt-6-luna` | najtańszy vision, $0.10/$0.50; dobry kandydat na "szybki podgląd" |
| OpenAI | `gpt-6.1-sol` / `gpt-6-sol` | **niepewne** – docs OpenAI podają `gpt-6.1-sol` ($2/$10), tabela AI SDK `gpt-6-sol`; zweryfikować przed użyciem |
| OpenAI | `gpt-5-mini` | w tabeli AI SDK; tańsza alternatywa jeśli GPT-6 nie zadziała z kluczem |
| Google | `gemini-3.8-flash` | stabilny flagowy Flash wg ai.google.dev; multimodal, JSON Schema (`additionalProperties`, `enum`, `min/max`, `maxItems` wspierane) |
| Google | `gemini-3.5-flash-lite` | najtańszy stabilny; multimodal |
| Google | `gemini-3.1-pro-preview` | preview, najmocniejszy reasoning; może być wolny |
| Google | `gemini-2.5-flash` | **ograniczony dostęp** (tylko istniejący użytkownicy) – nie planować na nim |
| OpenRouter | `anthropic/claude-sonnet-5.5` | id potwierdzone w docs OpenRouter; pozostałe id (`openai/gpt-6-luna`, `google/gemini-3.8-flash`) **do sprawdzenia** na openrouter.ai/models z filtrem `structured_outputs` |

## Plan implementacji (po sygnale użytkownika)

1. `pnpm add ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google @openrouter/ai-sdk-provider`; lokalnie Node 26 spełnia wymóg AI SDK 7 (Node 22+); podbić `@types/node` do `^22` dla spójności.
2. `src/lib/ai/provider.ts`: `getModel()` z `switch (process.env.AI_PROVIDER)`; domyślne modele: anthropic `claude-opus-5-5`, openai `gpt-6-luna`, google `gemini-3.8-flash`, openrouter `anthropic/claude-sonnet-5.5`. Brak klucza = czytelny błąd 500 jak dziś.
3. `src/lib/ai/analyze.ts`: `generateText` + `Output.object({ schema: SkinAnalysis })`, obraz jako `file` part, `providerOptions.anthropic` tylko gdy provider = anthropic. Zwraca `result.output` (typ `SkinAnalysis`).
4. Odchudzić `route.ts`: walidacja body bez zmian, wywołanie `analyzeSkin`, mapowanie błędów (`NoObjectGeneratedError` -> 502, `APICallError` 429 -> 429, refusal -> 422).
5. `.env.example`: nowe zmienne + komentarze. `docs/TECH-SETUP.md` sekcja 3: jedna linia o `AI_PROVIDER`.
6. Test ręczny: to samo zdjęcie przez `AI_PROVIDER=anthropic`, `openai`, `google`; porównać JSON (czy `findings`, `routine` max 3 kroki, `photo_quality` zachowują się tak samo). Zapisać wnioski w tej notatce.
7. Opcjonalnie: parametr `?provider=` w dev mode do przełączania z UI (tylko gdy `NODE_ENV !== "production"`).

Szacunek: 2–3 h razem z testami na trzech providerach.

## Ryzyka

- **Zod 4 vs provider schema.** `ai@7` wspiera Zod `^3.25.76 || ^4.1.8`, ale OpenAI strict mode i Gemini odrzucają część JSON Schema (np. `min/max` na liczbach u OpenAI, głęboko zagnieżdżone schematy u Gemini). Nasz schemat ma `z.number().min(0).max(1)`, `.max(3)` na tablicach i `nullable`; jeśli któryś provider odrzuci, poluzować schemat lub ustawić `Output.object({ schema, ... })` bez strict i walidować po stronie serwera.
- **Refusal/safety.** Zdjęcia zmian skórnych mogą trafić w klasyfikatory medyczne. Anthropic ma `fallbacks: "default"` przez `providerOptions`; OpenAI/Google nie mają odpowiednika, więc UX "model odmówił" musi działać dla każdego providera.
- **Jakość i format odpowiedzi różnią się między modelami.** Prompt pisany pod Claude (polski, confidence, max 3 kroki) trzeba przetestować na GPT i Gemini; możliwe osobne dopiski per provider w `prompt.ts`.
- **Node 22 / ESM.** Lokalnie jest Node 26 (OK), ale `@types/node ^20` w package.json jest niespójne; na Vercel upewnić się, że runtime projektu to Node 22+. AI SDK 7 jest ESM-only, więc żadnych `require()` w `src/lib/ai/`.
- **Nieznane id modeli.** Rodzina GPT-6 i Gemini 3.x wykracza poza moją wiedzę treningową; id pochodzą z fetch'a oficjalnych docs z dziś, ale `gpt-6.1-sol` vs `gpt-6-sol` i id OpenRouter trzeba potwierdzić pierwszym wywołaniem (błąd 404 od providera = zła nazwa).
- **OpenRouter structured output** zależy od upstream providera; dla pewności włączyć `require_parameters: true` w opcjach providera lub zostać przy natywnych providerach do demo.
- **Koszt i latencja.** Opus 5.5 z `effort: high` to 10–30 s; na demo warto mieć `gpt-6-luna` albo `gemini-3.5-flash-lite` jako szybki tryb podglądu i Opus/Sonnet jako pełną analizę.
