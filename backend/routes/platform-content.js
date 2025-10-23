const express = require('express');
const router = express.Router();

// Mock data for platform content (shared with master-content.js)
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
  },
  {
    id: 3,
    master_content_id: 1,
    platform: 'FACEBOOK',
    content: "Sztuczna inteligencja zmienia oblicze biznesu! 🎆\n\nW naszym najnowszym przewodniku dowiesz się:\n🔹 Jak AI automatyzuje procesy i zwiększa efektywność\n🔹 Jakie są najlepsze praktyki implementacji\n🔹 Jak rozwiązać wyzwania etyczne i regulacyjne\n🔹 Dlaczego ROI z AI osiąga 300% w 2 lata\n\nCo myślisz o przyszłości AI w Twojej branży? 💭",
    hashtags: ['AI', 'Biznes', 'Innowacje', 'Technologia', 'Przyszlosc'],
    mentions: [],
    media_urls: [],
    scheduled_for: null,
    status: 'READY_FOR_REVIEW',
    decision: 'PENDING',
    target_accounts: [],
    created_at: '2025-01-15T15:10:00Z',
    updated_at: '2025-01-15T15:10:00Z',
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

// GET /api/platform-content - List platform contents
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      platform, 
      status, 
      decision, 
      master_content_id 
    } = req.query;
    
    let filteredData = [...mockPlatformContents];

    // Apply filters
    if (platform) {
      filteredData = filteredData.filter(item => item.platform === platform);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (decision) {
      filteredData = filteredData.filter(item => item.decision === decision);
    }
    
    if (master_content_id) {
      filteredData = filteredData.filter(item => item.master_content_id === parseInt(master_content_id));
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
    console.error('Error fetching platform contents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform contents',
      code: 'FETCH_ERROR'
    });
  }
});

// GET /api/platform-content/:id - Get specific platform content
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const platformContent = mockPlatformContents.find(pc => pc.id === parseInt(id));
    
    if (!platformContent) {
      return res.status(404).json({
        success: false,
        message: 'Platform content not found',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: platformContent
    });
  } catch (error) {
    console.error('Error fetching platform content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform content',
      code: 'FETCH_ERROR'
    });
  }
});

// PUT /api/platform-content/:id - Update platform content
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const platformContentIndex = mockPlatformContents.findIndex(pc => pc.id === parseInt(id));
    
    if (platformContentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Platform content not found',
        code: 'NOT_FOUND'
      });
    }

    // Update the platform content
    mockPlatformContents[platformContentIndex] = {
      ...mockPlatformContents[platformContentIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockPlatformContents[platformContentIndex]
    });
  } catch (error) {
    console.error('Error updating platform content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update platform content',
      code: 'UPDATE_ERROR'
    });
  }
});

// POST /api/platform-content/:id/decision - Make a publish decision
router.post('/:id/decision', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, target_accounts, scheduled_for, notes, user_id } = req.body;
    
    const platformContentIndex = mockPlatformContents.findIndex(pc => pc.id === parseInt(id));
    
    if (platformContentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Platform content not found',
        code: 'NOT_FOUND'
      });
    }

    // Update the platform content with decision
    mockPlatformContents[platformContentIndex].decision = decision;
    mockPlatformContents[platformContentIndex].updated_at = new Date().toISOString();
    
    if (target_accounts) {
      mockPlatformContents[platformContentIndex].target_accounts = target_accounts;
    }
    
    if (scheduled_for) {
      mockPlatformContents[platformContentIndex].scheduled_for = scheduled_for;
    }
    
    if (notes) {
      mockPlatformContents[platformContentIndex].decision_notes = notes;
    }
    
    // Update status based on decision
    switch (decision) {
      case 'PUBLISH':
        mockPlatformContents[platformContentIndex].status = 'PUBLISHED';
        mockPlatformContents[platformContentIndex].published_at = new Date().toISOString();
        break;
      case 'PUBLISH_ON_SCHEDULE':
        mockPlatformContents[platformContentIndex].status = 'SCHEDULED';
        break;
      case 'POSTPONE':
        mockPlatformContents[platformContentIndex].status = 'POSTPONED';
        break;
      case 'DECLINE':
        mockPlatformContents[platformContentIndex].status = 'DECLINED';
        break;
      default:
        break;
    }

    res.json({
      success: true,
      data: mockPlatformContents[platformContentIndex]
    });
  } catch (error) {
    console.error('Error making publish decision:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make publish decision',
      code: 'DECISION_ERROR'
    });
  }
});

// GET /api/social-media/platform/:platform - Get social media accounts by platform
router.get('/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const accounts = mockSocialAccounts[platform.toUpperCase()] || [];

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching social media accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media accounts',
      code: 'FETCH_ERROR'
    });
  }
});

module.exports = router;