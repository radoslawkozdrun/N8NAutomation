# RSS Review Interface

Nowoczesny, responsywny interfejs webowy do przeglądania i zarządzania artykułami RSS z wykorzystaniem ocen AI. Zaprojektowany do efektywnego przeglądu 20-50 artykułów dziennie w czasie 15-30 minut.

## ✨ Funkcje

### 📊 Dashboard Overview
- **Statystyki w czasie rzeczywistym**: Liczba artykułów oczekujących na review, średni score, rozkład kategorii
- **Szybkie filtry**: Dostęp do najpopularniejszych filtrów jednym kliknięciem
- **Aktywność**: Historia ostatnich akcji i decyzji
- **Auto-refresh**: Automatyczne odświeżanie danych co 30 sekund

### 📝 Lista Artykułów do Review
- **Dwa tryby widoku**: Karty (szczegółowe) i tabela (kompaktowa)
- **Inteligentne sortowanie**: Według score, daty, priorytetu
- **Kolorowe wskaźniki**: Score z gradientem kolorów, priorytety z różnymi kolorami
- **Podgląd treści**: Podsumowanie AI, key takeaways, tagi
- **Szybkie akcje**: Accept/Reject bezpośrednio z listy

### 🔍 Szczegółowy Widok Artykułu
- **Pełny modal**: Wszystkie informacje o artykule w jednym miejscu
- **AI Insights**: Breakdown scoringu, uzasadnienie AI, key takeaways
- **Oryginalny content**: Podgląd z opcją rozwinięcia pełnej treści
- **Notatki**: Możliwość dodania komentarzy do decyzji
- **Szybkie akcje**: Accept, Reject, Mark for Later

### ⚡ Bulk Operations
- **Multi-select**: Checkbox dla każdego artykułu
- **Bulk actions**: Accept All, Reject All, filtrowanie według threshold
- **Keyboard shortcuts**: Pełna obsługa klawiatury dla maksymalnej efektywności

### 🎯 Zaawansowane Filtrowanie
- **Search**: Wyszukiwanie w tytułach, tagach, autorach
- **Kategorie**: AI_ML, WEB_DEV, MOBILE_DEV, DATA_SCIENCE, DEVOPS, SECURITY
- **Priorytety**: P0_BREAKING, P1_TRENDING, P2_TIMELY, P3_EVERGREEN, P4_FILLER
- **Target Audience**: developers, architects, managers, beginners, experts
- **Score Range**: Filtrowanie według przedziału punktowego
- **Quick Filters**: High Score (>80), Trending (P1), AI/ML Only, Breaking News

### ⌨️ Keyboard Shortcuts
- `j/k` - Nawigacja góra/dół
- `a` - Accept current/selected articles
- `r` - Reject current/selected articles
- `d` - Show article details
- `x` - Toggle selection
- `Shift+A` - Select/deselect all
- `Enter` - Open details
- `Escape` - Clear selection
- `?` - Show shortcuts help

### 🎨 Design & UX
- **Dark/Light Mode**: Automatyczne wykrywanie preferencji systemu
- **Responsive Design**: Pełna obsługa mobile i tablet
- **Accessibility**: WCAG 2.1 compliance, keyboard navigation
- **Loading States**: Skeleton screens i loading indicators
- **Error Handling**: Graceful error handling z retry options

## 🛠️ Stack Technologiczny

### Frontend
- **React 18** - Biblioteka UI z hooks i Suspense
- **TypeScript** - Type safety i developer experience
- **Vite** - Fast build tool i development server
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Lucide React** - Modern icon library

### State Management & API
- **TanStack Query** - Server state management i caching
- **React Hot Toast** - Toast notifications
- **Framer Motion** - Smooth animations

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Instalacja i Uruchomienie

### Wymagania
- Node.js 18+ 
- npm 8+ lub yarn 1.22+

### Instalacja
```bash
# Clone repository
git clone <repository-url>
cd N8NAutomation

# Zainstaluj dependencies
npm install

# Skopiuj i skonfiguruj environment variables
cp .env.example .env.local
```

### Konfiguracja Environment Variables
Utwórz plik `.env.local`:
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Optional: Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_OFFLINE_MODE=false
```

### Development
```bash
# Uruchom development server
npm run dev

# Aplikacja będzie dostępna pod http://localhost:3000
```

### Build dla Production
```bash
# Build aplikacji
npm run build

# Preview production build
npm run preview
```

### Linting
```bash
# Sprawdź code quality
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

## 📡 API Integration

### Wymagane Endpoints

Aplikacja wymaga następujących API endpoints:

#### Articles
```
GET /api/articles
- Query params: page, limit, status, category, priority, target_audience, score_min, score_max, search, tags
- Response: PaginatedResponse<Article>

GET /api/articles/{id}
- Response: ApiResponse<Article>

POST /api/articles/{id}/decision
- Body: { action: 'accept' | 'reject' | 'needs_more', notes?: string }
- Response: ApiResponse<Article>

POST /api/articles/bulk-update
- Body: { articleIds: number[], action: 'accept' | 'reject', notes?: string }
- Response: ApiResponse<{ updated_count: number }>
```

#### Dashboard
```
GET /api/dashboard/stats
- Response: ApiResponse<DashboardStats>

GET /api/health
- Response: ApiResponse<{ status: string, timestamp: string }>
```

#### Metadata
```
GET /api/articles/tags
- Response: ApiResponse<string[]>

GET /api/articles/categories  
- Response: ApiResponse<string[]>
```

### Example API Response
```json
{
  "data": {
    "id": 1,
    "title": "Advanced React Patterns in 2024",
    "author": "John Doe",
    "link": "https://example.com/article",
    "summary": "AI-generated summary...",
    "category": "WEB_DEV",
    "subcategory": "React",
    "tags": ["react", "patterns", "hooks"],
    "priority": "P1_TRENDING",
    "target_audience": "developers",
    "final_score": 85,
    "relevance_score": 90,
    "novelty_score": 80,
    "viral_score": 85,
    "value_score": 85,
    "key_takeaways": ["Key point 1", "Key point 2"],
    "reasoning": "AI reasoning for the score...",
    "status": "NEW",
    "created_date": "2024-01-15T10:30:00Z"
  },
  "success": true
}
```

## 🎯 Workflow Usage

### Typowy Flow Review
1. **Dashboard** - Sprawdź statystyki i liczbę oczekujących artykułów
2. **Lista** - Przejdź do widoku artykułów (przycisk "Review Articles")
3. **Filtrowanie** - Użyj quick filters lub zaawansowanych filtrów
4. **Review** - Przejrzyj artykuły używając keyboard shortcuts:
   - `j/k` do nawigacji
   - `d` do szczegółów ważnych artykułów
   - `a` do szybkiego akceptowania
   - `r` do odrzucania
5. **Bulk Operations** - Zaznacz wiele artykułów i wykonaj bulk actions
6. **Finish** - Wróć do dashboard aby sprawdzić progress

### Tips dla Maksymalnej Efektywności
- Użyj quick filter "High Score (>80)" do priorytetowych artykułów
- Sortuj według score (domyślnie) dla najlepszych artykułów na górze
- Użyj `Shift+A` do szybkiego zaznaczenia wszystkich
- Akcje bulk są szybsze niż pojedyncze dla dużych grup
- Dark mode redukuje zmęczenie oczu podczas długich sesji

## 🔧 Customization

### Dodawanie Nowych Kategorii
```typescript
// src/types/index.ts
export type ArticleCategory = 
  | 'AI_ML'
  | 'WEB_DEV'
  | 'MOBILE_DEV'
  | 'YOUR_NEW_CATEGORY'; // Dodaj tutaj

// src/lib/utils.ts
export function getCategoryLabel(category: ArticleCategory): string {
  const labels = {
    // ... existing labels
    YOUR_NEW_CATEGORY: 'Your Label',
  };
  return labels[category];
}
```

### Custom Color Scheme
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#your-color-50',
          // ... your color palette
        }
      }
    }
  }
}
```

### Dodawanie Nowych Keyboard Shortcuts
```typescript
// src/hooks/useKeyboardShortcuts.ts
const newShortcuts: KeyboardShortcut[] = [
  {
    key: 'your-key',
    action: 'your-action',
    description: 'Your description',
    handler: yourHandler,
  }
];
```

## 🐛 Troubleshooting

### Problemy z Build
```bash
# Clear cache i reinstall
rm -rf node_modules package-lock.json
npm install

# Sprawdź TypeScript errors
npm run build
```

### API Connection Issues
1. Sprawdź `VITE_API_URL` w `.env.local`
2. Upewnij się że backend API jest uruchomiony
3. Sprawdź CORS configuration na backend
4. Sprawdź network tab w browser dev tools

### Performance Issues
1. Włącz React DevTools Profiler
2. Sprawdź Network tab dla zbyt dużych payloads
3. Zwiększ `staleTime` w React Query config
4. Użyj pagination dla dużych list

## 📈 Performance Metrics

### Target Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Bundle Size Limits
- **Initial Bundle**: < 250KB gzipped
- **Vendor Bundle**: < 150KB gzipped
- **Total Assets**: < 500KB gzipped

## 🤝 Contributing

### Code Style
- Używaj TypeScript dla wszystkich nowych plików
- Przestrzegaj ESLint rules
- Używaj Prettier dla formatowania
- Pisz descriptive commit messages

### Pull Request Process
1. Fork repository
2. Utwórz feature branch
3. Napisz testy dla nowych funkcji
4. Upewnij się że wszystkie testy przechodzą
5. Utwórz Pull Request z szczegółowym opisem

## 📄 License

Ten projekt jest licencjonowany pod MIT License. Zobacz plik `LICENSE` dla szczegółów.

## 🆘 Support

Jeśli masz problemy lub pytania:
1. Sprawdź istniejące Issues w repository
2. Utwórz nowy Issue z szczegółowym opisem problemu
3. Dołącz screenshot i browser/OS info
4. Sprawdź console errors w browser dev tools

---

**Zbudowano z ❤️ dla efektywnego content review workflow**