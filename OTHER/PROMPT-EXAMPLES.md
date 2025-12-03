# 🎯 Przykładowe Prompty dla Claude z Playwright MCP

## Dla Vibe Coding

### 1. Podstawowy workflow z automatycznym testowaniem

```
Pomóż mi dodać nową funkcję sortowania do komponentu Dashboard.

IMPORTANT: Po zakończeniu pracy:
1. Użyj playwright-test MCP aby zweryfikować frontend
2. Sprawdź czy nie ma błędów konsoli
3. Jeśli znajdziesz błędy, napraw je automatycznie
4. Powtarzaj kroki 1-3 aż wszystkie testy przejdą
5. Pokaż mi finalne wyniki testów

Dopiero wtedy oznacz pracę jako zakończoną.
```

### 2. Z wymuszeniem naprawy błędów

```
Zrefaktoruj komponent UserProfile używając najlepszych praktyk React.

WORKFLOW:
1. Wprowadź zmiany w kodzie
2. Uruchom playwright-test MCP
3. Jeśli są błędy konsoli lub warningi TypeScript:
   - Napraw je wszystkie
   - Przetestuj ponownie
   - Nie przechodź dalej dopóki wszystko nie działa
4. Pokaż mi raport z testów (errors, warnings, performance)
5. Dopiero wtedy zakończ zadanie
```

### 3. Pre-commit verification

```
Skończyłem pracę nad feature X. Przed commitowaniem:

1. Uruchom pełne testy frontendu używając Playwright MCP
2. Sprawdź:
   ✓ TypeScript compilation
   ✓ Console errors
   ✓ Console warnings
   ✓ Performance metrics
3. Wygeneruj raport HTML
4. Pokaż mi summary:
   - Liczba błędów
   - Liczba warningów
   - Czas ładowania strony
   - Status każdego testu

Jeśli cokolwiek jest nie tak - napraw to zanim zakończysz.
```

### 4. Multi-page testing

```
Przetestuj wszystkie główne strony aplikacji:
- / (homepage)
- /dashboard
- /settings
- /profile

Dla każdej strony:
1. Użyj Playwright MCP z --save-video
2. Sprawdź console errors i warnings
3. Zmierz performance (load time)
4. Zapisz screenshot

Podsumuj wyniki w tabeli i pokaż mi które strony mają problemy.
```

### 5. Mobile testing

```
Przetestuj responsywność nowego komponentu na urządzeniach mobilnych.

Użyj Playwright MCP z konfiguracją:
- iPhone 15 (390x844)
- iPad Pro (1024x1366)
- Samsung Galaxy S21 (360x800)

Dla każdego urządzenia sprawdź:
- Czy layout się nie psuje
- Czy nie ma console errors
- Czy wszystko jest klikalne
- Zapisz screenshot

Pokaż mi porównanie wyników.
```

## Dla debugowania

### 6. Debug konkretnego błędu

```
Mam błąd w konsoli: "Cannot read property 'map' of undefined" w Dashboard.tsx

Pomóż mi go zdiagnozować:
1. Użyj Playwright MCP w headed mode (bez --headless)
2. Nawiguj do /dashboard
3. Pokaż mi exact stack trace
4. Zaproponuj fix
5. Przetestuj fix z Playwright
6. Upewnij się że błąd zniknął
```

### 7. Performance investigation

```
Strona ładuje się wolno. Użyj Playwright MCP żeby sprawdzić:

1. Ile czasu zajmuje:
   - Navigation
   - DOM Content Loaded
   - Load Event
2. Jakie są najwolniejsze network requests
3. Czy są console warnings związane z performance
4. Zapisz trace.zip do dalszej analizy

Zaproponuj optymalizacje na podstawie wyników.
```

### 8. Regression testing

```
Właśnie zmieniłem logikę w komponencie X. 

Uruchom regression tests:
1. Przetestuj przed zmianą (checkout poprzedni commit)
2. Uruchom Playwright tests i zapisz wyniki
3. Wróć do aktualnej wersji
4. Uruchom testy ponownie
5. Porównaj:
   - Nowe błędy konsoli?
   - Nowe warnings?
   - Zmiany w performance?

Jeśli regresja - napraw natychmiast.
```

## Dla CI/CD

### 9. Pre-deploy checks

```
Przed deploymentem na produkcję:

1. Uruchom pełne testy z Playwright MCP:
   - Build production bundle
   - Test z production config
   - Sprawdź wszystkie critical paths
   - Verify API endpoints

2. Wymagania do PASS:
   - Zero console errors
   - Zero TypeScript errors
   - Performance < 3s load time
   - All critical features working

3. Wygeneruj production-ready report

4. Tylko jeśli wszystko OK - mark as ready to deploy
```

### 10. Post-deploy verification

```
Deploy się udał. Zweryfikuj że wszystko działa:

1. Użyj Playwright MCP z production URL
2. Test all critical user flows:
   - Login
   - Dashboard load
   - Creating content
   - Settings
3. Monitor console dla unexpected errors
4. Compare metrics z pre-deploy

Alert me jeśli cokolwiek jest nie tak.
```

## Dla development

### 11. Feature development workflow

```
Dodaj nową feature: [OPIS FEATURE]

DEVELOPMENT CYCLE:
1. Implement feature
2. npm run test:frontend (lub Playwright MCP)
3. Fix any issues
4. Repeat 2-3 until clean
5. Manual test in browser
6. Final automated test
7. Mark as done

NIE OZNACZAJ JAKO DONE dopóki:
- Build passes
- Zero console errors
- Zero critical warnings
- Feature works as expected (tested)
```

### 12. Component library testing

```
Stwórz nowy reusable component: [COMPONENT_NAME]

Po stworzeniu:
1. Create example usage page
2. Test z Playwright MCP:
   - Different props combinations
   - Edge cases
   - Error states
3. Verify no console warnings
4. Check accessibility (jeśli możliwe)
5. Document any issues

Component is ready tylko jeśli wszystkie testy pass.
```

## Advanced

### 13. A/B testing comparison

```
Mam dwie wersje komponentu (v1 i v2).

Compare them z Playwright:
1. Test v1:
   - Performance metrics
   - Console errors/warnings
   - Screenshot
2. Test v2:
   - Same metrics
3. Generate comparison report:
   - Which is faster?
   - Which has fewer errors?
   - Which looks better?

Recommend which version to use.
```

### 14. Cross-browser testing

```
Test komponent X na różnych przeglądarkach.

Użyj Playwright MCP z:
- Chrome (--browser chrome)
- Firefox (--browser firefox)  
- Webkit (--browser webkit)

Dla każdej przeglądarki:
- Run tests
- Capture errors
- Note any browser-specific issues
- Save screenshots

Report compatibility matrix.
```

### 15. Load testing simulation

```
Symuluj obciążenie aplikacji.

Using Playwright:
1. Open multiple browser contexts (5-10)
2. Each context navigates to different pages
3. Monitor:
   - Response times
   - Console errors
   - Memory usage (jeśli możliwe)
4. Identify bottlenecks

Report findings with recommendations.
```

## Template workflow

### 16. Universal test template

```
[ZADANIE DO WYKONANIA]

TESTING PROTOCOL:
1. ✅ TypeScript compilation
2. ✅ Dev server starts
3. ✅ No console errors
4. ✅ No critical warnings
5. ✅ Feature works as expected
6. ✅ Performance acceptable (<3s)
7. ✅ Mobile responsive (jeśli applicable)

WORKFLOW:
- Implement changes
- Run: npm run test:frontend
- Fix issues if any
- Repeat until all ✅ checked
- Generate final report
- Mark as DONE

NEVER mark as done with:
❌ Console errors present
❌ TypeScript errors
❌ Broken functionality
❌ Poor performance (>5s load)
```

## Pro Tips dla efektywnego testowania

### 17. Quick sanity check

```
Quick sanity check przed commitem:

1. npm run test:quick (tylko TypeScript)
2. Jeśli pass → commit
3. Jeśli fail → napraw i spróbuj ponownie

Use this dla małych zmian (typo fixes, style changes, etc.)
```

### 18. Deep integration test

```
Pełny integration test przed merge do main:

1. npm run test:frontend (full test suite)
2. Check wszystkie artifacts:
   - test-report.html
   - trace.zip
   - video.webm
3. Verify zero console errors
4. Performance regression check
5. Document test results

Required przed merge do main branch.
```

### 19. Continuous monitoring

```
Setup continuous monitoring:

Every commit na main:
1. Trigger Playwright tests automatycznie
2. Save reports w GitHub Artifacts
3. Notify team jeśli tests fail
4. Block merge jeśli critical errors

Protect main branch quality.
```

### 20. Emergency hotfix protocol

```
Dla emergency hotfix:

FAST TRACK:
1. Fix the issue
2. npm run test:quick
3. Jeśli pass → deploy immediately
4. npm run test:frontend (post-deploy)
5. Monitor production errors

Balance speed with safety.
```

## Przykłady dla specyficznych przypadków

### 21. Testowanie formularzy

```
Nowy formularz contact form potrzebuje testów:

Test scenarios:
1. Empty form submission
2. Invalid email format
3. Missing required fields
4. Successful submission
5. Network error handling

Dla każdego scenario:
- Use Playwright MCP
- Verify proper error messages
- Check console for errors
- Verify UX feedback

Report all issues found.
```

### 22. Testowanie nawigacji

```
Test all navigation paths w aplikacji:

Starting from homepage:
1. Click każdy link w menu
2. Verify correct page loads
3. Check for console errors
4. Verify breadcrumbs (jeśli są)
5. Test back button

Map all navigation issues in report.
```

### 23. Testowanie API integration

```
Nowy API endpoint został dodany. Test integration:

1. Start dev server
2. Use Playwright MCP z network monitoring
3. Trigger API calls przez UI
4. Verify:
   - Correct endpoints called
   - Proper error handling
   - Loading states
   - Success states
5. Check console errors related to API

Document any issues with API layer.
```

### 24. Testowanie dark mode

```
Test dark mode implementation:

1. Test w light mode:
   - Screenshots
   - Console errors
   - Verify readability
2. Switch to dark mode
3. Test w dark mode:
   - Same checks
4. Toggle between modes multiple times
5. Verify no console errors during toggle

Ensure smooth theme switching.
```

### 25. Testowanie real-time features

```
Test real-time notifications feature:

1. Open app w Playwright
2. Trigger notifications (simulate lub manual)
3. Verify:
   - Notifications appear correctly
   - No console errors
   - Proper animations
   - Dismiss functionality works
4. Test multiple notifications
5. Test edge cases (many notifications)

Report any timing or rendering issues.
```

## Maintenance i monitoring

### 26. Weekly health check

```
Weekly frontend health check:

1. Run full test suite
2. Compare z previous week:
   - New console warnings?
   - Performance regression?
   - New TypeScript errors?
3. Generate trend report
4. Action items dla next sprint

Keep codebase healthy long-term.
```

### 27. Dependency update testing

```
Po update dependencies:

CRITICAL TEST:
1. npm install
2. npm run build (verify builds)
3. npm run test:frontend
4. Check dla:
   - Breaking changes
   - New warnings
   - Performance changes
5. Test critical user flows manually

Safe dependency updates.
```

### 28. Documentation update check

```
Po major code changes:

1. Run tests
2. Generate fresh screenshots
3. Update documentation images
4. Verify examples still work
5. Update CHANGELOG.md

Keep docs in sync with code.
```

---

## 📝 Szablon do skopiowania

```
[TWOJE ZADANIE]

TEST REQUIREMENTS:
□ TypeScript compilation passes
□ No console errors
□ No critical warnings  
□ Feature works correctly
□ Performance acceptable
□ Mobile responsive (if applicable)

PROCESS:
1. Implement feature
2. Run automated tests
3. Fix any issues
4. Repeat until clean
5. Manual verification
6. Document results

DO NOT MARK DONE until all □ checked ✅
```

---

**Pro tip:** Skopiuj odpowiedni template i dostosuj do swojego przypadku użycia. Im bardziej konkretny prompt, tym lepsze wyniki!

**Pamiętaj:** Playwright MCP to narzędzie, które pomaga wychwycić błędy PRZED deploymentem. Use it liberally!

---

**Autor:** FlowCraft Testing Team  
**Data:** 2025-09-30  
**Wersja:** 1.0.0
