import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { ArticleDetailModal } from '@/components/ArticleDetailModal';
// import { Login } from '@/components/Login'; // Old login component
import { AccountPanel } from '@/components/AccountPanel';
import { FeedManagement } from '@/components/FeedManagement';
import { DomainManagement } from '@/components/DomainManagement';
import Dashboard from '@/pages/dashboard/index';
import { NewSocialMediaAccountManagement } from '@/components/NewSocialMediaAccountManagement';
// Reference app pages
import ArticleListPage from '@/pages/article-list/index';
import ArticleDetailsPage from '@/pages/article-details/index';
import LoginPage from '@/pages/login/index';
import UserManagementPage from '@/pages/user-management/index';
import ConfigPropertiesManagement from '@/pages/config-properties/index';
import ContentAdaptationPage from '@/pages/content-adaptation/index';
import MasterContentPage from '@/pages/master-content/index';
import MasterContentEditPage from '@/pages/master-content-edit/index';
import SocialPlatformsPage from '@/pages/social-platforms/index';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Article, ViewType } from '@/types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('new-dashboard');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedArticle(null);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="App">
        <NavigationProvider currentView="new-dashboard" onViewChange={() => { }}>
          <LoginPage />
        </NavigationProvider>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="App">
      <NavigationProvider currentView={currentView} onViewChange={setCurrentView}>
        <Layout
          currentView={currentView}
          onViewChange={setCurrentView}
        >
          {currentView === 'article-list-page' ? (
            <ArticleListPage />
          ) : currentView === 'article-details' ? (
            <ArticleDetailsPage />
          ) : currentView === 'user-management' ? (
            <UserManagementPage />
          ) : currentView === 'config-properties' ? (
            <ConfigPropertiesManagement />
          ) : currentView === 'master-content' ? (
            <MasterContentPage />
          ) : currentView === 'master-content-edit' ? (
            <MasterContentEditPage />
          ) : currentView === 'social-platforms' ? (
            <SocialPlatformsPage />
          ) : currentView === 'content-adaptation' ? (
            <ContentAdaptationPage />
          ) : currentView === 'new-dashboard' ? (
            <Dashboard />
          ) : currentView === 'new-social-media-accounts' ? (
            <NewSocialMediaAccountManagement />
          ) : currentView === 'account' ? (
            <AccountPanel user={user} />
          ) : currentView === 'feeds' ? (
            <FeedManagement />
          ) : currentView === 'domains' ? (
            <DomainManagement />
          ) : null}
        </Layout>
      </NavigationProvider>

      {/* Article detail modal */}
      <ArticleDetailModal
        articleId={selectedArticle?.id || null}
        isOpen={detailModalOpen}
        onClose={handleCloseModal}
      />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-gray-100',
          duration: 4000,
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;