import React, { useState } from 'react';
import StatCard from './dashboard/StatCard';
import ActivityFeed from './dashboard/ActivityFeed';
import PendingArticlesOverview from './dashboard/PendingArticlesOverview';
import ScoreDistributionChart from './dashboard/ScoreDistributionChart';
import FeedHealthMonitor from './dashboard/FeedHealthMonitor';
import QuickActions from './dashboard/QuickActions';
import { toast } from 'react-hot-toast';

export function NewDashboard() {
  const [user] = useState({
    id: 1,
    name: 'Anna Kowalska',
    email: 'anna.kowalska@opix.pl',
    role: 'ADMIN'
  });

  // Mock data for dashboard statistics
  const [dashboardStats] = useState({
    totalArticles: 1247,
    pendingReview: 23,
    averageScore: 7.8,
    activeFeeds: 15,
    todayProcessed: 45,
    weeklyGrowth: '+12%'
  });

  const [pendingCounts] = useState({
    NEW: 8,
    PENDING_REVIEW: 15,
    NEEDS_MORE: 5
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'article_accepted',
      user: 'Piotr Nowak',
      action: 'zaakceptował artykuł',
      target: 'React 18 - Nowe funkcje',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      type: 'article_rejected',
      user: 'Maria Wiśniewska',
      action: 'odrzucił artykuł',
      target: 'Przestarzałe praktyki CSS',
      timestamp: new Date(Date.now() - 600000)
    },
    {
      id: 3,
      type: 'feed_added',
      user: 'Anna Kowalska',
      action: 'dodał nowe źródło RSS',
      target: 'TechCrunch AI',
      timestamp: new Date(Date.now() - 900000)
    },
    {
      id: 4,
      type: 'bulk_operation',
      user: 'Tomasz Kowalczyk',
      action: 'wykonał masową operację na',
      target: '12 artykułach',
      timestamp: new Date(Date.now() - 1200000)
    },
    {
      id: 5,
      type: 'user_login',
      user: 'Katarzyna Zielińska',
      action: 'zalogował się do systemu',
      timestamp: new Date(Date.now() - 1800000)
    }
  ]);

  const [scoreDistribution] = useState([
    { name: 'Trafność', value: 8.2 },
    { name: 'Nowość', value: 7.5 },
    { name: 'Wiralność', value: 6.8 },
    { name: 'Wartość', value: 8.9 },
    { name: 'Końcowy', value: 7.8 }
  ]);

  const [categoryDistribution] = useState([
    { name: 'AI/ML', value: 145 },
    { name: 'Web Dev', value: 298 },
    { name: 'Mobile', value: 187 },
    { name: 'DevOps', value: 156 },
    { name: 'Security', value: 123 },
    { name: 'Inne', value: 338 }
  ]);

  const [feedStats] = useState({
    active: 15,
    errors: 2,
    inactive: 3
  });

  const [recentErrors] = useState([
    {
      id: 1,
      feedName: 'TechCrunch RSS',
      message: 'Timeout połączenia - przekroczono limit czasu',
      severity: 'high' as const,
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: 2,
      feedName: 'Dev.to Feed',
      message: 'Błąd parsowania XML - nieprawidłowa struktura',
      severity: 'medium' as const,
      timestamp: new Date(Date.now() - 3600000)
    }
  ]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'NEW': 
      case 'PENDING_REVIEW': 
      case 'NEEDS_MORE':
        // navigate(`/article-list?status=${action}`);
        toast.success(`Przekierowanie do artykułów: ${action}`);
        break;
      case 'BULK_ACCEPT': 
        toast.success('Przekierowanie do operacji masowych...');
        // navigate('/article-list?bulk=true');
        break;
      case 'HIGH_PRIORITY': 
        toast.success('Przekierowanie do wysokich priorytetów...');
        // navigate('/article-list?priority=P0_BREAKING,P1_TRENDING');
        break;
      case 'review_pending': 
        toast.success('Przekierowanie do przeglądu oczekujących...');
        // navigate('/article-list?status=PENDING_REVIEW');
        break;
      case 'bulk_operations': 
        toast.success('Przekierowanie do operacji masowych...');
        // navigate('/article-list?bulk=true');
        break;
      case 'add_feed': 
        toast.success('Przekierowanie do dodawania źródeł RSS...');
        // navigate('/rss-feed-management?action=add');
        break;
      case 'manage_users': 
        toast.success('Przekierowanie do zarządzania użytkownikami...');
        // navigate('/user-management');
        break;
      case 'export_data':
        toast.success('Rozpoczęto eksport danych. Plik zostanie pobrany za chwilę.');
        break;
      case 'system_settings': 
        toast.success('Funkcja ustawień systemu będzie dostępna wkrótce.');
        break;
      default:
        break;
    }
  };

  const handleViewAllArticles = () => {
    toast.success('Przekierowanie do wszystkich artykułów...');
    // navigate('/article-list');
  };

  const handleViewFeedDetails = () => {
    toast.success('Przekierowanie do zarządzania źródłami RSS...');
    // navigate('/rss-feed-management');
  };

  const handleStatCardClick = (type: string) => {
    switch (type) {
      case 'articles': 
        toast.success('Przekierowanie do artykułów...');
        // navigate('/article-list');
        break;
      case 'feeds': 
        toast.success('Przekierowanie do źródeł RSS...');
        // navigate('/rss-feed-management');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Panel główny
            </h1>
            <p className="text-muted-foreground mt-1">
              Witaj ponownie, {user?.name}! Oto przegląd Twojej aktywności.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Ostatnia aktualizacja
            </p>
            <p className="text-sm font-medium text-foreground">
              {new Date()?.toLocaleString('pl-PL')}
            </p>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Łączna liczba artykułów"
            value={dashboardStats?.totalArticles?.toLocaleString('pl-PL')}
            change={dashboardStats?.weeklyGrowth}
            changeType="positive"
            icon="FileText"
            description="Wszystkie artykuły w systemie"
            onClick={() => handleStatCardClick('articles')}
          />
          <StatCard
            title="Oczekujące przeglądu"
            value={dashboardStats?.pendingReview}
            icon="Clock"
            description="Artykuły wymagające decyzji"
            onClick={() => handleQuickAction('PENDING_REVIEW')}
          />
          <StatCard
            title="Średni wynik AI"
            value={dashboardStats?.averageScore}
            change="+0.3"
            changeType="positive"
            icon="TrendingUp"
            description="Średnia ocena jakości"
          />
          <StatCard
            title="Aktywne źródła RSS"
            value={dashboardStats?.activeFeeds}
            icon="Rss"
            description="Działające źródła artykułów"
            onClick={() => handleStatCardClick('feeds')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Articles Overview */}
            <PendingArticlesOverview
              pendingCounts={pendingCounts}
              onViewAll={handleViewAllArticles}
              onQuickAction={handleQuickAction}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ScoreDistributionChart
                data={scoreDistribution}
                type="bar"
                title="Średnie wyniki AI"
              />
              <ScoreDistributionChart
                data={categoryDistribution}
                type="pie"
                title="Rozkład kategorii"
              />
            </div>

            {/* Feed Health Monitor */}
            <FeedHealthMonitor
              feedStats={feedStats}
              recentErrors={recentErrors}
              onViewDetails={handleViewFeedDetails}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions
              onAction={handleQuickAction}
              userRole={user?.role}
            />

            {/* Activity Feed */}
            <ActivityFeed
              activities={recentActivities}
            />
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Przetworzone dzisiaj"
            value={dashboardStats?.todayProcessed}
            icon="CheckCircle"
            description="Artykuły przejrzane dzisiaj"
          />
          <StatCard
            title="Średni czas przeglądu"
            value="2.3 min"
            icon="Timer"
            description="Czas na artykuł"
          />
          <StatCard
            title="Wskaźnik akceptacji"
            value="78%"
            change="+5%"
            changeType="positive"
            icon="ThumbsUp"
            description="Procent zaakceptowanych"
          />
        </div>
      </div>
    </div>
  );
}