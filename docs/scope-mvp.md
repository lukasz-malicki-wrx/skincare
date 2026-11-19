# Plan MVP — co dodać

Ten plik jest listą pracy w repo. Numery ekranów odpowiadają kolejności w przepływie aplikacji. Ścieżki są w `src/config/routes.ts`.

## Decyzje zamknięte

Te punkty są ustalone.

| Temat | Zostaje |
| --- | --- |
| Logowanie | E-mail i hasło. Rejestracja i logowanie są już zrobione. E-mail musi mieć poprawny format. Hasło ma co najmniej 6 znaków. |
| Baza | Turso (`@libsql/client`). Zmienne: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. Na Vercelu te same wartości w ustawieniach projektu. |
| Płatność | Animowany mock. Jedno pole stanu w Turso. Zero Stripe i innych operatorów. |
| Analiza zdjęcia | `POST /api/analyze`, model Anthropic, wynik walidowany schematem Zod w `src/lib/skin-analysis.ts`. Opis kosmetyczny, nie diagnoza. |
| Język interfejsu | Polski i angielski (`src/i18n`). Klucze biorą się z angielskiego obiektu. |
| Mapa | Lista sklepów i link do Map Google. |

Automatyczne konto z loginem `skin-4821` i hasłem ze słownika nie wchodzi. Supabase nie wchodzi.

## Już jest w repo

- Landing (`/`) oddzielony od PWA (`/app`).
- Rejestracja, logowanie, sesja w ciasteczku, wylogowanie na profilu.
- Tabele Turso: `users`, `sessions`.
- Dolny pasek: Dziś, Plan, Skanuj, Asystent, Profil.
- Ekran 4, zdjęcie: kamera, galeria, podgląd, kompresja, loader analizy (`/app/start/photo`).
- Ekran 7, raport: wynik ostatniej analizy trzymany w `localStorage` (`/app/start/report`).
- Ekran 12, Dziś: pusty stan i link do ostatniego raportu. Reszta dashboardu pusta.
- Plan, Skanuj, Asystent, Profil: same placeholdery (profil ma wylogowanie).

Wynik analizy nie jest jeszcze zapisany na koncie. Po wylogowaniu zostaje tylko w przeglądarce.

## Do dodania

### Onboarding

| Ekran | Ścieżka | Co dobudować |
| --- | --- | --- |
| 1 Welcome | `/app` | Jest. Po zalogowaniu prowadź dalej według stanu konta, nie zawsze na zdjęcie. |
| 2 Konto gotowe | — | Nie rób. Zastępuje go istniejący formularz rejestracji. |
| 2b Logowanie | `/app/sign-in` | Jest, na e-mailu. Po sukcesie wznawiaj ostatni krok onboardingu. |
| 3 Zgoda na zdjęcie | nowa, przed kamerą | Checkbox wymagany. Tekst: zdjęcia tylko na koncie, bez trenowania modeli, usunięcie w Profilu, to nie jest porada medyczna. |
| 4 Kamera | `/app/start/photo` | Jest. Zostaw widoczny upload z galerii, gdy nie ma zgody na kamerę. |
| 5 Podgląd | w tym samym ekranie | Jest („Powtórz” / użycie zdjęcia). |
| 6 Loader analizy | w tym samym ekranie | Jest. Dodać komunikat, gdy na zdjęciu nie ma twarzy, i wyjście „wypełnij formularz ręcznie”. |
| 7 Raport | `/app/start/report` | Jest tekstowo. Dodać Skin Score (pierścień), szacowany wiek skóry, obszary na zdjęciu, zastrzeżenie „to nie jest diagnoza”. Zapis raportu w Turso, nie tylko w `localStorage`. |
| 8 Profil skóry | nowa | Formularz wstępnie wypełniony z analizy: wiek, typ skóry, problemy, alergie skórne, obecna pielęgnacja, cele. Pola z modelu oznaczone „AI”. |
| 9 Budżet i dieta | nowa | Suwak 50–500 zł, styl planu, chipy dietetyczne (wegetarianin, wegan, bez laktozy, bez glutenu, orzechy, ryby, inne). Przycisk „Zbuduj mój plan”. |
| 10 Paywall | nowa | Rozmyty plan, jedna cena: 7 dni za 0 zł, potem 29 zł miesięcznie. Widoczna data pierwszego obciążenia i kwota. Przycisk odpala animację (2–3 s) i zapisuje stan `trial`. Drugi przycisk wraca do darmowego raportu. |
| 11 Trial aktywny | nowa | Potwierdzenie na kilka sekund i pytanie o przypomnienie 2 dni przed końcem trialu. Dalej na Plan. |

Wznowienie sesji:

- brak sesji → Welcome
- sesja bez zgody na zdjęcie → ekran 3
- sesja bez raportu → ekran 4
- raport bez subskrypcji → paywall
- trial albo subskrypcja aktywna → Dziś

### Aplikacja po paywallu

Bez subskrypcji ekrany 14, 15, 17, 19 i 21 są rozmyte, z kłódką i przyciskiem do paywalla. Darmowe zostają: konto, analiza, raport, formularz profilu.

| Ekran | Ścieżka | Co dobudować |
| --- | --- | --- |
| 12 Dziś | `/app/today` | Streak, odhaczanie rutyny rano/wieczór, suwak porównania zdjęć, krzywa Skin Score, oś czasu wpisów. Pusty stan zostaje na dzień zero. |
| 13 Wpis postępu | modal | Zdjęcie (z nakładką poprzedniego), głos, tekst z nastrojem. Po zdjęciu nowe Skin Score. Jedna linijka komentarza asystenta. |
| 14 Plan, pielęgnacja | `/app/plan` | Rano / wieczór, karty kroków z produktem, ceną, składnikami i instrukcją. Suma vs budżet. Podmiana natychmiastowa, bez wołania modelu: filtr katalogu po kategorii, typie skóry i cenie. |
| 15 Plan, dieta | ta sama ścieżka, druga zakładka | „Jedz więcej” / „Ogranicz”, filtr po ograniczeniach z ekranu 9. Dodawanie, usuwanie, przegenerowanie. |
| 16 Produkt | modal | Zdjęcie, marka, cena, „dlaczego dla Ciebie”, składniki, „na co uważać”, „jak stosować”. Zamiana i „gdzie kupię”. |
| 17 Skaner | `/app/scan` | Tylna kamera, kod kreskowy, wpisanie kodu, zdjęcie etykiety, latarka. |
| 18 Wynik skanu | stan skanera | Werdykt zielony / żółty / czerwony względem profilu. Trzy listy składników. Dodanie do planu albo zdjęcie etykiety, gdy produktu nie ma w bazie. |
| 19 Asystent | `/app/assistant` | Tekst i głos (Web Speech API). Krótka odpowiedź plus karta zmiany planu do zatwierdzenia albo odrzucenia. Podpowiedzi startowe. Bez mikrofonu zostaje sam tekst. |
| 20 Profil | `/app/profile` | E-mail konta, status subskrypcji z datą i kwotą, anulowanie, edycja profilu i budżetu, nowa analiza, powiadomienia lokalne, usunięcie zdjęć i konta, pobranie danych. Ukryty przycisk demo „przewiń o 7 dni”. Wylogowanie jest. |
| 21 Sklepy | modal | Lista po odległości: „masz tu 3 z 4 produktów”. Miasto wpisywane ręcznie, gdy nie ma geolokacji. „Nawiguj” otwiera Mapy Google. Podmiana brakującego produktu na asortyment sklepu. |

### Dane w Turso

Dokładaj tabele obok `users` i `sessions` w `src/lib/db.ts`. Zdjęcia jako bloby albo URL-e; w MVP wystarczy trzymanie w Turso albo w polu tekstowym, byle były przypisane do `user_id` i dało się je skasować.

- `skin_profiles` — zgoda na zdjęcie, wiek, typ skóry, problemy, alergie, pielęgnacja, cele, budżet, styl budżetu, ograniczenia dietetyczne
- `analyses` — zdjęcie, wynik JSON (zgodny z `SkinAnalysis`), skin score, wiek skóry, `created_at`
- `subscriptions` — `none | trial | active | cancelled`, `trial_ends_at`, kwota 29 zł
- `products` — katalog około 40 pozycji, 6 kategorii, różne ceny, składniki, instrukcja
- `plan_steps` — rano/wieczór, kolejność, `product_id`, cena z chwili doboru
- `diet_items` — jeść / ograniczyć, tekst, uzasadnienie
- `progress_entries` — zdjęcie, głos, tekst, nastrój, skin score
- `routine_checks` — data, krok, zrobione
- `scans` — kod lub zdjęcie etykiety, werdykt, JSON składu
- `shops` i `shop_stock` — sklep, typ, odległość przykładowa albo współrzędne, które produkty ma

Katalog produktów jest nasz. Model przy układaniu planu wybiera `product_id` z katalogu. Podmiana produktu nie woła modelu.

### Asystent i plan

- Asystent zmienia plan tylko po zatwierdzeniu karty przez użytkownika.
- Dieta nie pokazuje produktów sprzecznych z ograniczeniami (wegan bez łososia, alergia na orzechy bez orzechów).
- Subskrypcja to jedno pole czytane przez zablokowane ekrany. Mock zawsze kończy się sukcesem.
- Anulowanie zostawia dostęp do `trial_ends_at`. Przycisk demo przesuwa tę datę o 7 dni i przełącza stan na `active`.
- Przypomnienia (rano 8:00, wieczór 22:00, zdjęcie tygodniowe, koniec trialu) są lokalne, w przeglądarce. Bez wysyłki z serwera.

## Poza MVP

Nie dodawać: logowania Google, Apple i Facebook, resetu hasła mailem, prawdziwej płatności, wielu planów cenowych, własnej mapy, koszyka, społeczności, panelu admina, powiadomień z serwera, pogody i UV, diagnozy medycznej.

## Definition of done

- PWA instaluje się z telefonu.
- Golden path przechodzi trzy razy: rejestracja mailem, zgoda, selfie, raport, profil, budżet, mock płatności, plan, podmiana, asystent, dieta, sklepy, skaner, wpis postępu, profil z datą obciążenia.
- Zablokowane ekrany prowadzą do paywalla.
- Podmiana produktu jest natychmiastowa.
- Nowe zdjęcie postępu przelicza Skin Score i krzywa się rysuje.
- Usunięcie zdjęć naprawdę kasuje wiersze użytkownika.
- Brak zgody na kamerę, mikrofon i lokalizację nie wywala ekranu.
- Na demo mówimy wprost, że płatność jest symulowana.
