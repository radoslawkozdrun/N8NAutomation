import React, { useState } from 'react';
import { ChevronRight, Edit3, Eye, Calendar, CheckCircle, Clock, FileText, Users, TrendingUp, Instagram, Twitter, Linkedin, Play } from 'lucide-react';

const ContentAdaptationApp = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingPlatform, setEditingPlatform] = useState(null);

  // Przykładowe dane
  const projects = [
    {
      id: 1,
      title: "AI w Content Marketingu - Przyszłość czy Zagrożenie?",
      date: "2025-01-15",
      status: "ready",
      platforms: {
        linkedin: { status: 'completed', engagement: '85%' },
        twitter: { status: 'completed', engagement: '92%' },
        instagram: { status: 'draft', engagement: '78%' },
        tiktok: { status: 'pending', engagement: '88%' }
      }
    },
    {
      id: 2,
      title: "Jak zwiększyć ROI z content marketingu o 300%",
      date: "2025-01-10",
      status: "in_progress",
      platforms: {
        linkedin: { status: 'completed', engagement: '91%' },
        twitter: { status: 'draft', engagement: '89%' },
        instagram: { status: 'pending', engagement: '82%' },
        tiktok: { status: 'pending', engagement: '85%' }
      }
    }
  ];

  const masterContent = {
    title: "AI w Content Marketingu - Przyszłość czy Zagrożenie?",
    coreMessage: "AI nie zastąpi content marketerów, ale marketerzy używający AI zastąpią tych, którzy tego nie robią.",
    keyTakeaways: [
      "AI zwiększa produktywność content marketingu o 300%",
      "Personalizacja treści na skalę staje się dostępna dla każdego",
      "Ludzka kreatywność pozostaje kluczowa w strategii"
    ],
    supportingData: "Badanie 2024 pokazuje, że firmy używające AI w content marketingu osiągają 23% wyższy ROI",
    cta: "Rozpocznij swoją podróż z AI w content marketingu już dziś"
  };

  const platformContent = {
    linkedin: {
      title: "LinkedIn Post",
      content: `🚀 AI w Content Marketingu: Game Changer czy Overrated?

Po 12 miesiącach testowania AI tools w naszej agencji, mam kilka insights:

✅ AI zwiększyło naszą produktywność o 300%
✅ Personalizacja treści na skalę? Teraz to możliwe
✅ Ludzka kreatywność? Ważniejsza niż kiedykolwiek

Najważniejsze odkrycie: AI nie zastąpi content marketerów, ale marketerzy używający AI zastąpią tych, którzy tego nie robią.

Badanie z 2024 potwierdza: firmy używające AI osiągają 23% wyższy ROI.

Co myślisz o AI w content marketingu? Zagrożenie czy szansa?

#ContentMarketing #AI #MarketingStrategy`,
      charCount: 542,
      charLimit: 1300,
      tone: "Professional, Engaging",
      bestTime: "Tue-Thu 9-10 AM"
    },
    twitter: {
      title: "Twitter Thread",
      content: `🧵 AI w Content Marketingu - co odkryłem po roku testów:

1/5 AI nie zastąpi content marketerów, ale marketerzy używający AI zastąpią tych, którzy tego nie robią 🎯

2/5 Nasze wyniki po roku z AI:
→ 300% wzrost produktywności
→ Personalizacja na skalę
→ 23% wyższy ROI

3/5 Biggest win: AI handles research & optimization, humans focus on strategy & creativity 🧠

4/5 Ludzka kreatywność stała się ważniejsza, nie mniej ważna. AI to narzędzie, nie zamiennik.

5/5 Ready to level up your content game with AI? The future is now 🚀

#ContentMarketing #AI #MarketingTips`,
      charCount: 495,
      charLimit: 280,
      tone: "Conversational, Thread Format",
      bestTime: "Mon-Fri 12-3 PM"
    },
    instagram: {
      title: "Instagram Post",
      content: `✨ AI CHANGED MY CONTENT GAME ✨

Rok temu bałam się, że AI zabierze mi pracę 😰
Dziś? AI to mój najlepszy teammate! 🤝

Co się zmieniło:
📈 3x faster content creation
🎯 Personalization at scale  
💡 More time for creative strategy
📊 23% better ROI

The truth? 👇
AI won't replace content creators...
But creators using AI will replace those who don't 🔥

Swipe to see my favorite AI tools for content! ➡️

What's your experience with AI in marketing? Tell me below! 👇

#ContentCreator #AIMarketing #DigitalMarketing #ContentStrategy #MarketingTips #CreativeProcess`,
      charCount: 486,
      charLimit: 2200,
      tone: "Personal, Visual Storytelling",
      bestTime: "Daily 6-9 PM"
    },
    tiktok: {
      title: "TikTok Script",
      content: `🎬 HOOK: "AI stole my job... and I'm THRILLED about it!" 

SCENE 1: *pointing at screen*
"Rok temu AI w marketingu = scary robot"

SCENE 2: *show before/after stats*
"Now? My productivity: 📈300%"
"My ROI: 📈23% higher"
"My stress: 📉90% lower"

SCENE 3: *confident pose*
"Plot twist: AI didn't replace me"
"It made me IRREPLACEABLE"

SCENE 4: *serious moment*
"Real talk: AI won't replace marketers..."
"But marketers using AI will replace those who don't"

CTA: "Ready to level up? Follow for AI marketing tips!"

#AIMarketing #ContentCreator #MarketingTips #TechTok #ProductivityHack #DigitalMarketing #AI #ContentStrategy`,
      charCount: 612,
      charLimit: 4000,
      tone: "Trendy, Educational Entertainment",
      bestTime: "Daily 7-9 PM, 12-2 PM"
    }
  };

  const PlatformIcon = ({ platform, size = 20 }) => {
    const icons = {
      linkedin: <Linkedin size={size} className="text-blue-600" />,
      twitter: <Twitter size={size} className="text-blue-400" />,
      instagram: <Instagram size={size} className="text-pink-500" />,
      tiktok: <Play size={size} className="text-black" />
    };
    return icons[platform];
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      pending: "bg-gray-100 text-gray-600",
      in_progress: "bg-blue-100 text-blue-800"
    };
    
    const labels = {
      completed: "Gotowe",
      draft: "Szkic",
      pending: "Oczekuje",
      in_progress: "W trakcie"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const DashboardScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Dashboard</h1>
          <p className="text-gray-600">Zarządzaj swoimi projektami treści</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <FileText size={16} className="mr-2" />
          Nowy projekt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktywne projekty</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Średnie engagement</p>
              <p className="text-2xl font-bold text-gray-900">86%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Platform adaptations</p>
              <p className="text-2xl font-bold text-gray-900">48</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Najnowsze projekty</h2>
        </div>
        
        <div className="divide-y">
          {projects.map(project => (
            <div key={project.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                 onClick={() => { setSelectedProject(project); setCurrentScreen('master'); }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.date}</p>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    {Object.entries(project.platforms).map(([platform, data]) => (
                      <div key={platform} className="flex items-center space-x-1">
                        <PlatformIcon platform={platform} size={16} />
                        <StatusBadge status={data.status} />
                        <span className="text-xs text-gray-500">({data.engagement})</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MasterContentScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => setCurrentScreen('dashboard')} 
                  className="text-gray-500 hover:text-gray-700">
            ← Powrót
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{masterContent.title}</h1>
            <p className="text-gray-600">Master Content Hub</p>
          </div>
        </div>
        
        <button onClick={() => setCurrentScreen('adaptation')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          Adaptuj treść <ChevronRight size={16} className="ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Główne przesłanie</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-lg text-blue-900 font-medium">{masterContent.coreMessage}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Kluczowe wnioski</h2>
            <ul className="space-y-3">
              {masterContent.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-700">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Dane wspierające</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">{masterContent.supportingData}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Status adaptacji</h2>
            <div className="space-y-3">
              {Object.entries(selectedProject?.platforms || {}).map(([platform, data]) => (
                <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <PlatformIcon platform={platform} />
                    <span className="font-medium capitalize">{platform}</span>
                  </div>
                  <StatusBadge status={data.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Call to Action</h2>
            <p className="text-gray-700 bg-green-50 border border-green-200 p-4 rounded-lg">
              {masterContent.cta}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const AdaptationScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => setCurrentScreen('master')} 
                  className="text-gray-500 hover:text-gray-700">
            ← Powrót
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Adaptation Workspace</h1>
            <p className="text-gray-600">Dostosuj treść pod każdą platformę</p>
          </div>
        </div>
        
        <button onClick={() => setCurrentScreen('review')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center">
          <Eye size={16} className="mr-2" />
          Przejdź do review
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Object.entries(platformContent).map(([platform, content]) => (
          <div key={platform} className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PlatformIcon platform={platform} size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                </div>
                
                <button 
                  onClick={() => setEditingPlatform(editingPlatform === platform ? null : platform)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded"
                >
                  <Edit3 size={16} />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>Ton: {content.tone}</span>
                <span className={`font-medium ${content.charCount > content.charLimit ? 'text-red-600' : 'text-green-600'}`}>
                  {content.charCount}/{content.charLimit} znaków
                </span>
              </div>
            </div>

            <div className="p-4">
              {editingPlatform === platform ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full h-64 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={content.content}
                    readOnly
                  />
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => setEditingPlatform(null)}
                      className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                    >
                      Anuluj
                    </button>
                    <button 
                      onClick={() => setEditingPlatform(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Zapisz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg min-h-64 whitespace-pre-line text-sm">
                    {content.content}
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    <Clock size={12} className="inline mr-1" />
                    Najlepszy czas publikacji: {content.bestTime}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReviewScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => setCurrentScreen('adaptation')} 
                  className="text-gray-500 hover:text-gray-700">
            ← Powrót
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review & Schedule</h1>
            <p className="text-gray-600">Ostateczna weryfikacja i harmonogram</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Calendar size={16} className="mr-2" />
            Zaplanuj publikację
          </button>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Publikuj teraz
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Podsumowanie adaptacji</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(platformContent).map(([platform, content]) => (
              <div key={platform} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <PlatformIcon platform={platform} />
                    <span className="font-medium capitalize">{platform}</span>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Znaki:</span>
                    <span className={`font-medium ${content.charCount > content.charLimit ? 'text-red-600' : 'text-green-600'}`}>
                      {content.charCount}/{content.charLimit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Gotowe</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Najlepszy czas: {content.bestTime}
                  </div>
                </div>

                <button className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Podgląd
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Harmonogram publikacji</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data rozpoczęcia
              </label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="2025-01-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interwał publikacji
              </label>
              <select className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Co 2 godziny</option>
                <option>Co 4 godziny</option>
                <option>Co 6 godzin</option>
                <option>Raz dziennie</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Sugerowany harmonogram:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• LinkedIn: Wtorek 9:00</li>
              <li>• Twitter: Wtorek 14:00</li>
              <li>• Instagram: Wtorek 19:00</li>
              <li>• TikTok: Środa 20:00</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const screens = {
    dashboard: <DashboardScreen />,
    master: <MasterContentScreen />,
    adaptation: <AdaptationScreen />,
    review: <ReviewScreen />
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {screens[currentScreen]}
      </div>
    </div>
  );
};

export default ContentAdaptationApp;