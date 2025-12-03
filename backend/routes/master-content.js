const express = require('express');
const router = express.Router();

// Mock data for master content
const mockMasterContents = [
  {
    id: 1,
    article_id: 101,
    title: "Przyszłość sztucznej inteligencji w biznesie - kompletny przewodnik 2025",
    content: "W 2025 roku sztuczna inteligencja staje się nieodzownym elementem strategii biznesowej. Firmy wykorzystują AI do automatyzacji procesów, analizy danych i personalizacji doświadczeń klientów. Ten artykuł przedstawia najważniejsze trendy, wyzwania i możliwości, jakie niesie ze sobą implementacja AI w różnych sektorach gospodarki.\n\nSztuczna inteligencja nie jest już technologią przyszłości - to rzeczywistość, która już dziś przekształca sposób działania firm na całym świecie. Od automatyzacji prostych zadań administracyjnych po złożone analizy predykcyjne, AI oferuje bezprecedensowe możliwości optymalizacji procesów biznesowych.\n\nKluczowe obszary zastosowań AI w biznesie obejmują:\n- Automatyzację obsługi klienta przez chatboty i asystentów wirtualnych\n- Analizę predykcyjną do przewidywania trendów rynkowych\n- Optymalizację łańcucha dostaw i zarządzanie zapasami\n- Personalizację oferty i doświadczeń użytkowników\n\nWyzwania implementacji AI w organizacjach to przede wszystkim kwestie etyczne, bezpieczeństwa danych oraz potrzeba przekwalifikowania pracowników. Firmy muszą także radzić sobie z rosnącymi wymaganiami regulacyjnymi dotyczącymi przejrzystości algorytmów AI.",
    summary: "Kompleksowe omówienie roli AI w biznesie 2025 roku, z praktycznymi wskazówkami implementacji.",
    key_points: [
      "AI automatyzuje procesy biznesowe zwiększając efektywność o 40%",
      "Personalizacja AI poprawia doświadczenia klientów i zwiększa konwersje",
      "Wyzwania etyczne i regulacyjne wymagają odpowiedzialnego podejścia",
      "ROI z inwestycji w AI osiąga średnio 300% w ciągu 2 lat"
    ],
    tags: ["ai", "business", "automation", "strategy", "2025"],
    category: "AI_ML",
    target_audience: "managers",
    tone: "professional",
    status: "READY_FOR_REVIEW",
    created_at: "2025-01-15T10:30:00Z",
    updated_at: "2025-01-15T14:20:00Z",
    created_by: 1,
    updated_by: 1
  },
  {
    id: 2,
    article_id: 102,
    title: "React 19: Nowe funkcje i zmiany dla deweloperów",
    content: "React 19 wprowadza rewolucyjne zmiany w ekosystemie frameworka. Nowe Server Components, ulepszone Hooks i optymalizacje wydajności zmieniają sposób tworzenia aplikacji webowych. Artykuł szczegółowo omawia wszystkie nowości i pokazuje praktyczne przykłady implementacji.\n\nServer Components stanowią jedną z największych innowacji w React 19. Pozwalają one na renderowanie komponentów bezpośrednio na serwerze, co znacznie poprawia wydajność aplikacji i SEO. Komponenty serwerowe mogą bezpośrednio łączyć się z bazami danych bez konieczności tworzenia dodatkowych warstw API.\n\nNowe Hooks wprowadzone w React 19:\n- useActionState - do zarządzania stanem formularzy\n- useOptimistic - do optymistycznych aktualizacji UI\n- use - uniwersalny hook do obsługi Promise i Context\n\nOptymalizacje wydajności obejmują ulepszony Reconciler, lepsze cache'owanie komponentów oraz zoptymalizowane re-renderowanie. Te zmiany przekładają się na szybsze ładowanie aplikacji i lepsze doświadczenie użytkownika.",
    summary: "Przegląd najważniejszych nowości w React 19 z praktycznymi przykładami kodu.",
    key_points: [
      "Server Components rewolucjonizują renderowanie po stronie serwera",
      "Nowe Hooks upraszczają zarządzanie stanem aplikacji",
      "Optymalizacje wydajności redukują czas ładowania o 30%",
      "Kompatybilność wsteczna zachowana dla React 18"
    ],
    tags: ["react", "javascript", "web-development", "frontend"],
    category: "WEB_DEV",
    target_audience: "developers",
    tone: "educational",
    status: "APPROVED",
    created_at: "2025-01-14T09:15:00Z",
    updated_at: "2025-01-14T16:45:00Z",
    created_by: 2,
    updated_by: 2
  },
  {
    id: 3,
    article_id: 103,
    title: "Cyberbezpieczeństwo w erze IoT - ochrona przed zagrożeniami",
    content: "Internet of Things (IoT) tworzy nowe możliwości, ale także nowe zagrożenia cyberbezpieczeństwa. Artykuł omawia główne wektory ataków na urządzenia IoT, metody ochrony i najlepsze praktyki implementacji zabezpieczeń w środowiskach IoT.\n\nUrządzenia IoT często charakteryzują się ograniczonymi zasobami obliczeniowymi i słabymi domyślnymi zabezpieczeniami. Producenci koncentrują się na funkcjonalności i kosztach, często zaniedbując aspekty bezpieczeństwa. To czyni sieci IoT atrakcyjnym celem dla cyberprzestępców.\n\nNajczęstsze zagrożenia w środowiskach IoT:\n- Słabe hasła domyślne i brak ich zmiany przez użytkowników\n- Niezabezpieczona komunikacja między urządzeniami\n- Brak regularnych aktualizacji firmware'u\n- Niewystarczająca segmentacja sieci\n\nStrategiczne podejście do zabezpieczania IoT wymaga implementacji zasad Zero Trust Architecture, gdzie każde urządzenie musi zostać zweryfikowane przed uzyskaniem dostępu do sieci.",
    summary: "Przewodnik po zabezpieczaniu urządzeń IoT przed współczesnymi zagrożeniami.",
    key_points: [
      "Urządzenia IoT często mają słabe domyślne zabezpieczenia",
      "Segmentacja sieci kluczowa dla ograniczenia rozprzestrzeniania ataków",
      "Regularne aktualizacje firmware'u redukują ryzyko o 70%",
      "Zero Trust Architecture optymalna dla środowisk IoT"
    ],
    tags: ["cybersecurity", "iot", "security", "network"],
    category: "SECURITY",
    target_audience: "architects",
    tone: "authoritative",
    status: "DRAFT",
    created_at: "2025-01-13T11:20:00Z",
    updated_at: "2025-01-13T15:30:00Z",
    created_by: 3,
    updated_by: 3
  }
];

// Mock data for platform content
const mockPlatformContents = [
  {
    id: 1,
    master_content_id: 1,
    platform: 'TWITTER',
    content: "🚀 Sztuczna inteligencja rewolucjonizuje biznes! W 2025 roku AI zwiększa efektywność procesów o 40% i zapewnia średnio 300% ROI w ciągu 2 lat. Czy Twoja firma już wykorzystuje potencjał AI? 🤖\n\n🔗 Przeczytaj pełny przewodnik",
    hashtags: ['AI', 'Business', 'Innovation', 'Tech2025', 'Automation'],
    mentions: ['TechInnovator', 'AIExperts'],
    media_urls: [],
    scheduled_for: null,
    status: 'READY_FOR_REVIEW',
    decision: 'PENDING',
    target_accounts: [],
    created_at: '2025-01-15T15:00:00Z',
    updated_at: '2025-01-15T15:00:00Z',
    published_at: null
  },
  {
    id: 2,
    master_content_id: 1,
    platform: 'LINKEDIN',
    content: "Przyszłość biznesu leży w sztucznej inteligencji 📊\n\nW 2025 roku obserwujemy bezprecedensowy wzrost implementacji AI w organizacjach na całym świecie. Kluczowe korzyści:\n\n• 40% wzrost efektywności procesów biznesowych\n• Lepsza personalizacja doświadczeń klientów\n• 300% ROI z inwestycji w AI w perspektywie 2 lat\n\nCzy Twoja organizacja ma już strategię AI? Podziel się swoimi doświadczeniami w komentarzach!",
    hashtags: ['AI', 'BusinessStrategy', 'Innovation', 'DigitalTransformation', 'Leadership'],
    mentions: ['LinkedInExpert'],
    media_urls: [],
    scheduled_for: null,
    status: 'READY_FOR_REVIEW',
    decision: 'PENDING',
    target_accounts: [],
    created_at: '2025-01-15T15:05:00Z',
    updated_at: '2025-01-15T15:05:00Z',
    published_at: null
  }
];

// Mock social media accounts
const mockSocialAccounts = {
  TWITTER: [
    {
      id: 1,
      platform: 'TWITTER',
      username: 'techcompany_pl',
      display_name: 'Tech Company Poland',
      is_active: true,
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z'
    },
    {
      id: 2,
      platform: 'TWITTER',
      username: 'ceo_techcompany',
      display_name: 'CEO Tech Company',
      is_active: true,
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z'
    }
  ],
  LINKEDIN: [
    {
      id: 3,
      platform: 'LINKEDIN',
      username: 'tech-company-poland',
      display_name: 'Tech Company Poland',
      is_active: true,
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z'
    }
  ],
  FACEBOOK: [
    {
      id: 4,
      platform: 'FACEBOOK',
      username: 'techcompanypoland',
      display_name: 'Tech Company Poland',
      is_active: true,
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z'
    }
  ],
  INSTAGRAM: [],
  TIKTOK: []
};

// GET /api/master-content - List master contents
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, tone, target_audience, search } = req.query;
    let filteredData = [...mockMasterContents];

    // Apply filters
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (category) {
      filteredData = filteredData.filter(item => item.category === category);
    }
    
    if (tone) {
      filteredData = filteredData.filter(item => item.tone === tone);
    }
    
    if (target_audience) {
      filteredData = filteredData.filter(item => item.target_audience === target_audience);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.summary.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredData.length,
        total_pages: Math.ceil(filteredData.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching master contents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch master contents',
      code: 'FETCH_ERROR'
    });
  }
});

// GET /api/master-content/:id - Get specific master content
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const masterContent = mockMasterContents.find(mc => mc.id === parseInt(id));
    
    if (!masterContent) {
      return res.status(404).json({
        success: false,
        message: 'Master content not found',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: masterContent
    });
  } catch (error) {
    console.error('Error fetching master content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch master content',
      code: 'FETCH_ERROR'
    });
  }
});

// PUT /api/master-content/:id - Update master content
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const masterContentIndex = mockMasterContents.findIndex(mc => mc.id === parseInt(id));
    
    if (masterContentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Master content not found',
        code: 'NOT_FOUND'
      });
    }

    // Update the master content
    mockMasterContents[masterContentIndex] = {
      ...mockMasterContents[masterContentIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockMasterContents[masterContentIndex]
    });
  } catch (error) {
    console.error('Error updating master content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update master content',
      code: 'UPDATE_ERROR'
    });
  }
});

// PATCH /api/master-content/:id/approve - Approve master content
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const masterContentIndex = mockMasterContents.findIndex(mc => mc.id === parseInt(id));
    
    if (masterContentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Master content not found',
        code: 'NOT_FOUND'
      });
    }

    mockMasterContents[masterContentIndex].status = 'APPROVED';
    mockMasterContents[masterContentIndex].updated_at = new Date().toISOString();

    res.json({
      success: true,
      data: mockMasterContents[masterContentIndex]
    });
  } catch (error) {
    console.error('Error approving master content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve master content',
      code: 'APPROVE_ERROR'
    });
  }
});

// PATCH /api/master-content/:id/reject - Reject master content
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const masterContentIndex = mockMasterContents.findIndex(mc => mc.id === parseInt(id));
    
    if (masterContentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Master content not found',
        code: 'NOT_FOUND'
      });
    }

    mockMasterContents[masterContentIndex].status = 'REJECTED';
    mockMasterContents[masterContentIndex].updated_at = new Date().toISOString();
    if (reason) {
      mockMasterContents[masterContentIndex].rejection_reason = reason;
    }

    res.json({
      success: true,
      data: mockMasterContents[masterContentIndex]
    });
  } catch (error) {
    console.error('Error rejecting master content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject master content',
      code: 'REJECT_ERROR'
    });
  }
});

// POST /api/master-content/:id/generate - Generate platform content
router.post('/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body;
    
    const masterContent = mockMasterContents.find(mc => mc.id === parseInt(id));
    if (!masterContent) {
      return res.status(404).json({
        success: false,
        message: 'Master content not found',
        code: 'NOT_FOUND'
      });
    }

    // Create new platform content
    const newPlatformContent = {
      id: mockPlatformContents.length + 1,
      master_content_id: parseInt(id),
      platform: platform,
      content: `Generated content for ${platform} from: ${masterContent.title.substring(0, 100)}...`,
      hashtags: masterContent.tags.slice(0, 5),
      mentions: [],
      media_urls: [],
      scheduled_for: null,
      status: 'READY_FOR_REVIEW',
      decision: 'PENDING',
      target_accounts: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null
    };

    mockPlatformContents.push(newPlatformContent);

    res.json({
      success: true,
      data: newPlatformContent
    });
  } catch (error) {
    console.error('Error generating platform content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate platform content',
      code: 'GENERATION_ERROR'
    });
  }
});

module.exports = router;
