# Claude - Development Guidelines 🛠️

## Konfiguracja Środowiska i Portów (WYMAGANE)

**MUSISZ** zapewnić spójność środowiska poprzez konsekwentne używanie zdefiniowanych portów.

### 1. Stałe Porty Aplikacji
* **Frontend (FE):** **3000**
* **Backend (BE):** **8002**

### 2. Procedura Uruchamiania
Przed przystąpieniem do pracy lub uruchomieniem testów, **ZAWSZE** wykonaj poniższe kroki, aby uniknąć konfliktów:

1.  **Zabij procesy:** Znajdź i zakończ wszystkie procesy uruchomione na portach **3000** i **8002**.
2.  **Pełny Rebuild:** Wykonaj pełną przebudowę projektów (backend i frontend).
3.  **Uruchomienie:** Uruchom **Frontend na 3000** i **Backend na 8002**.

---

## 🌍 Język i Standardy Lokalizacji (WYMAGANE)

**Aplikacja jest pisana wyłącznie w języku angielskim.**

### 1. Zasady Językowe
* **Wszystkie elementy HTML, komponenty UI, etykiety, przyciski i komunikaty muszą być w języku angielskim.**
* **NIE TŁUMACZ** żadnych wartości na inne języki.
* **Treści dynamiczne** (jeśli pochodzą z API lub bazy danych) również powinny być w języku angielskim, chyba że specyfikacja wymaga inaczej.

### 2. Przykłady
* ✅ `<button>Submit</button>`
* ✅ `<label>Email Address</label>`
* ❌ `<button>Zatwierdź</button>`
* ❌ `<label>Adres Email</label>`

---

## 🎨 Standardy Wyglądu i Komponentów UI (WYMAGANE)

**Styl wszystkich stron musi być spójny i wzorowany na szablonie Skote.**

### 1. Główna Referencja Wizualna
* **Wzorzec:** [https://themesbrand.com/skote/layouts/index.html](https://themesbrand.com/skote/layouts/index.html)
* **Wymaganie:** Wygląd tworzonej aplikacji musi być **niemal identyczny** jak strona wzorcowa pod względem:
  * Układu strony (layout)
  * Komponentów UI (przyciski, formularze, karty, tabele, nawigacja)
  * Stylu wizualnego (kolory, typografia, odstępy)
  * Responsywności

### 2. Tworzenie Nowych Stron
* **ZAWSZE** wzoruj się na komponentach dostępnych na stronie: [https://themesbrand.com/skote/layouts/index.html](https://themesbrand.com/skote/layouts/index.html)
* Używaj tych samych:
  * Struktur layoutu (sidebary, headery, footers)
  * Kart i paneli
  * Formularzy i kontrolek
  * Tabel i list
  * Ikon i przycisków
  * Kolorystyki i motywów

### 3. Spójność Stylu
* **Każda nowa strona** musi zachowywać wizualną spójność z resztą aplikacji.
* **Użyj FireCrawl** (jeśli potrzebne) do pobrania struktury i stylów ze strony wzorcowej.

---

## 🔥 Instrukcje Dla Kontekstu i Pamięci AI

Aby zapewnić, że Claude Code ma pełną wiedzę na temat projektu, standardów i zewnętrznych inspiracji, **MUSISZ** używać narzędzi kontekstowych.

### 1. Protokół Pamięci (MCP) dla Struktury Projektu
**Narzędzie:** [Knowledge Graph Memory MCP](https://playbooks.com/mcp/modelcontextprotocol-knowledge-graph-memory#claude-desktop-setup)
* **Cel:** Zapewnienie trwałej, ustrukturyzowanej pamięci na temat struktury kodu, zależności i głównych modułów aplikacji.
* **Instrukcja dla Claude:** **MUSISZ** aktywnie korzystać z serwera **MCP Knowledge Graph** do zapisywania i odczytywania mapy kodu. Jeśli wprowadzana jest zmiana strukturalna (nowy katalog, główny komponent), **zaktualizuj graf wiedzy**.

### 2. Crawling Stron z Inspiracjami (FireCrawl)
**Narzędzie:** FireCrawl
* **Cel:** Pobranie czystej treści i struktury ze stron referencyjnych w celu dokładnego odwzorowania wyglądu.
* **Instrukcja dla Claude:** Gdy otrzymasz link do strony z inspiracjami frontendowymi, **ZAWSZE** użyj **FireCrawl**, aby przetworzyć ją na użyteczny kontekst Markdown i uniknąć zanieczyszczenia kontekstu niepotrzebnymi elementami.
* **Główna Referencja Frontend:** Strona [https://themesbrand.com/skote/layouts/index.html](https://themesbrand.com/skote/layouts/index.html) jest **idealnym wzorcem**. Wygląd tworzonej aplikacji musi być **niemal identyczny** jak ta strona pod względem układu, komponentów UI i stylu.

### 3. Najnowsza Dokumentacja (Context7)
**Narzędzie:** Context7
* **Cel:** Zapewnienie dostępu do aktualnych, oficjalnych dokumentacji dla wszystkich narzędzi i bibliotek.
* **Instrukcja dla Claude:** Przed użyciem lub modyfikacją zewnętrznej biblioteki, **sprawdź Context7**, aby upewnić się, że Twoje rozwiązania są zgodne z **najnowszą dokumentacją**.

---

## 🔒 Standardy Kodowania i Kontrola Jakości (MCP ESLint)

### 1. Zapewnienie Jakości Kodu (ESLint MCP Server)
**Narzędzie:** [ESLint MCP Server](https://eslint.org/docs/latest/use/mcp)
* **Cel:** Automatyczne i bezwzględne egzekwowanie standardów czystego kodu (clean code).
* **Instrukcja dla Claude:** **ZAWSZE** używaj **serwera ESLint MCP** jako autorytatywnego źródła zasad formatowania, lintingu i standardów JavaScript/TypeScript. Żaden kod nie może zostać zakończony ani skompletowany, jeśli nie przechodzi pomyślnie weryfikacji przez ten serwer.

---

## 🧪 Rygorystyczny Proces Testowania (Przed Ukończeniem Zadania)

**Twoim zadaniem jest zapewnienie najwyższej jakości. Nie możesz zgłosić ukończenia zadania dopóki testy nie zostaną zakończone z sukcesem.**

### ⚠️ BARDZO WAŻNE - Automatyczne Testowanie Po Każdej Zmianie

**PO KAŻDYM ŻĄDANIU ZMIANY W KODZIE APLIKACJI MUSISZ:**

1. **Automatycznie uruchomić aplikację** (Frontend i Backend)
2. **Sprawdzić błędy kompilacji:**
   - Błędy TypeScript/JavaScript
   - Błędy budowania (build errors)
   - Błędy zależności (dependency errors)
3. **Sprawdzić konsolę przeglądarki:**
   - Błędy JavaScript/TypeScript w runtime
   - Ostrzeżenia (warnings)
   - Błędy sieciowe (network errors)
   - Błędy React (component errors)
4. **Sprawdzić logi backendu:**
   - Błędy serwera
   - Błędy API endpoints
   - Błędy połączeń z bazą danych
   - Błędy walidacji

**ŻADNA ZMIANA NIE JEST UKOŃCZONA**, dopóki:
- ✅ Aplikacja się uruchamia bez błędów
- ✅ Konsola przeglądarki jest czysta (brak błędów, dopuszczalne tylko nieistotne warningi)
- ✅ Backend działa poprawnie i odpowiada na żądania
- ✅ Wszystkie wprowadzone zmiany działają zgodnie z oczekiwaniami

**Jeśli wykryjesz błędy - NAPRAW JE NATYCHMIAST przed zgłoszeniem ukończenia zadania.**

---

Po **każdej modyfikacji** lub dodaniu funkcjonalności wykonaj:

### 1. Pełna Przebudowa i Ponowne Uruchomienie
* **Ściśle przestrzegaj** procedury uruchamiania (zabicie portów **3000/8002**, rebuild, ponowne uruchomienie).

### 2. Kompleksowe Testowanie (Backend i Frontend)
**MUSISZ** wykonać następujące testy, aby **dobrze przetestować** stworzony kod:

| Etap Testowania | Cel | Wymagane Działanie |
| :--- | :--- | :--- |
| **Testy Backend (BE)** | Logika biznesowa i spójność API. | Uruchom **wszystkie** testy jednostkowe i integracyjne. Sprawdź odpowiedzi API pod kątem poprawności danych i statusów. |
| **Testy Frontend (FE)** | Integracja logiki i poprawność UI. | Uruchom **wszystkie** testy komponentów i E2E (jeśli są dostępne). |
| **Ręczna Weryfikacja FE** | Doświadczenie użytkownika (UX) i wizualne odwzorowanie wzorca. | **Dokładnie** sprawdź całą ścieżkę użytkownika. **Porównaj** wygląd interfejsu z **wzorem** [https://themesbrand.com/skote/layouts/index.html](https://themesbrand.com/skote/layouts/index.html). |
| **Weryfikacja Konsoli** | Błędy i wydajność w przeglądarce. | **Konsola musi być czysta** (brak błędów JavaScript/TypeScript i krytycznych ostrzeżeń) po załadowaniu i podczas interakcji. |
| **Weryfikacja Językowa** | Spójność językowa aplikacji. | **Upewnij się**, że wszystkie elementy UI są w języku angielskim i nie zawierają tłumaczeń na inne języki. |
| **Weryfikacja Wizualna** | Zgodność ze stylem Skote. | **Porównaj** każdy element UI z odpowiednikiem na stronie wzorcowej Skote. Sprawdź kolory, odstępy, typografię i responsywność. |

### 3. Weryfikacja Ukończenia Zadania
* **Zadanie jest ukończone TYLKO wtedy**, gdy:
    * **Aplikacja uruchamia się bez błędów** (Frontend i Backend).
    * **Konsola przeglądarki jest całkowicie czysta** (brak błędów, dopuszczalne tylko nieistotne warningi).
    * **Backend działa poprawnie** (brak błędów w logach, wszystkie endpointy odpowiadają).
    * Wszystkie testy automatyczne (BE i FE) przeszły.
    * Weryfikacja ESLint (przez MCP) została zakończona bez błędów.
    * Ręczna weryfikacja UI potwierdza niemal idealne odwzorowanie wzorca Skote.
    * Wszystkie elementy UI są w języku angielskim.
    * Styl wizualny jest spójny z szablonem Skote.
    * **Wszystkie wprowadzone zmiany zostały przetestowane i działają poprawnie.**

---

## ⚡ Protokół Naprawy Błędów (NATYCHMIASTOWY)

**Jeśli podczas automatycznego testowania wykryjesz JAKIEKOLWIEK błędy:**

### 1. Priorytet Naprawy
* **STOP** - Zatrzymaj dalszą pracę nad nowymi funkcjami
* **FIX** - Napraw wszystkie błędy NATYCHMIAST
* **TEST** - Przetestuj ponownie aplikację
* **VERIFY** - Upewnij się, że błędy nie powróciły

### 2. Kategorie Błędów (według priorytetu)
1. **KRYTYCZNE** - Aplikacja się nie uruchamia / Crash
2. **WYSOKIE** - Funkcjonalność nie działa / Błędy w konsoli
3. **ŚREDNIE** - Ostrzeżenia wpływające na działanie
4. **NISKIE** - Drobne ostrzeżenia nie wpływające na funkcjonalność

### 3. Raportowanie
Po naprawie błędów, **ZAWSZE** zgłoś:
* Jakie błędy zostały wykryte
* Co zostało naprawione
* Jak zweryfikowano naprawę

**NIE PRZCHODŹ DALEJ** bez naprawienia wszystkich błędów KRYTYCZNYCH i WYSOKICH.

---

## Checklist Przed Commitem (Rozszerzony)

- [ ] **AUTOMATYCZNE TESTOWANIE WYKONANE** - Aplikacja uruchomiona i przetestowana po wprowadzeniu zmian.
- [ ] **KONSOLA PRZEGLĄDARKI CZYSTA** - Brak błędów i krytycznych ostrzeżeń.
- [ ] **BACKEND DZIAŁA POPRAWNIE** - Brak błędów w logach, wszystkie endpointy odpowiadają.
- [ ] **WSZYSTKIE BŁĘDY NAPRAWIONE** - Żadnych błędów KRYTYCZNYCH ani WYSOKICH.
- [ ] Wykorzystano **MCP Knowledge Graph** do odczytania/zapisu kontekstu struktury.
- [ ] Uruchomiono **FireCrawl** (jeśli podano nowy link inspiracyjny) lub użyto kontekstu z głównego wzorca.
- [ ] Sprawdzono **Context7** dla najnowszej dokumentacji (jeśli dotyczy).
- [ ] Wykonano pełny rebuild projektu i uruchomienie na portach **3000/8002**.
- [ ] Wszystkie testy jednostkowe/integracyjne/E2E przeszły pomyślnie.
- [ ] Kod zweryfikowany przez serwer **ESLint MCP** jest wolny od błędów jakościowych.
- [ ] Funkcjonalność FE przetestowana ręcznie i zgodna z wyglądem [https://themesbrand.com/skote/layouts/index.html](https://themesbrand.com/skote/layouts/index.html).
- [ ] **Wszystkie elementy UI są w języku angielskim** (brak tłumaczeń).
- [ ] **Styl wizualny jest spójny** z szablonem Skote (layout, komponenty, kolory, typografia).
- [ ] **Nowe strony wykorzystują komponenty** ze strony wzorcowej Skote.
- [ ] **Wprowadzone zmiany zostały przetestowane** i działają zgodnie z oczekiwaniami.