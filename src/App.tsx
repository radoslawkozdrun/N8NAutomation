import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { ArticleList } from '@/components/ArticleList';
import { AllArticles } from '@/components/AllArticles';
import { ArticleDetailModal } from '@/components/ArticleDetailModal';
import { Login } from '@/components/Login';
import { AccountPanel } from '@/components/AccountPanel';
import { FeedManagement } from '@/components/FeedManagement';
import { PostReview } from '@/components/PostReview';
import { UserManagement } from '@/components/UserManagement';
import { DomainManagement } from '@/components/DomainManagement';
import { NewDashboard } from '@/components/NewDashboard';
import { NewPostCreation } from '@/components/NewPostCreation';
import { NewSocialMediaAccountManagement } from '@/components/NewSocialMediaAccountManagement';
// Reference app pages
import Dashboard from '@/pages/dashboard/index.tsx';
import ArticleListPage from '@/pages/article-list/index.tsx';
import ArticleDetailsPage from '@/pages/article-details/index.tsx';
import LoginPage from '@/pages/login/index.tsx';
import RSSFeedManagement from '@/pages/rss-feed-management/index.tsx';
import UserManagementPage from '@/pages/user-management/index.tsx';
import PostCreationPage from '@/pages/post-creation/index.tsx';
import SocialMediaAccountManagementPage from '@/pages/social-media-account-management/index.tsx';
import NotFound from '@/pages/NotFound.tsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Article } from '@/types';

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
  const [currentView, setCurrentView] = useState<'articles' | 'all-articles' | 'account' | 'feeds' | 'post-review' | 'users' | 'domains' | 'new-dashboard' | 'new-post-creation' | 'new-social-media-accounts' | 'dashboard' | 'article-list-page' | 'article-details' | 'rss-feeds' | 'user-management' | 'post-creation' | 'social-media-management'>('dashboard');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    // Refresh the page to reload auth state
    window.location.reload();
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    setDetailModalOpen(true);
  };

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
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="App">
      <Layout 
        currentView={currentView} 
        onViewChange={setCurrentView}
      >
        {currentView === 'dashboard' ? (
          <Dashboard />
        ) : currentView === 'article-list-page' ? (
          <ArticleListPage />
        ) : currentView === 'article-details' ? (
          <ArticleDetailsPage />
        ) : currentView === 'rss-feeds' ? (
          <RSSFeedManagement />
        ) : currentView === 'user-management' ? (
          <UserManagementPage />
        ) : currentView === 'post-creation' ? (
          <PostCreationPage />
        ) : currentView === 'social-media-management' ? (
          <SocialMediaAccountManagementPage />
        ) : currentView === 'new-dashboard' ? (
          <NewDashboard />
        ) : currentView === 'new-post-creation' ? (
          <NewPostCreation />
        ) : currentView === 'new-social-media-accounts' ? (
          <NewSocialMediaAccountManagement />
        ) : currentView === 'articles' ? (
          <ArticleList onArticleSelect={handleArticleSelect} />
        ) : currentView === 'all-articles' ? (
          <AllArticles />
        ) : currentView === 'post-review' ? (
          <PostReview />
        ) : currentView === 'account' ? (
          <AccountPanel user={user} />
        ) : currentView === 'feeds' ? (
          <FeedManagement />
        ) : currentView === 'users' ? (
          <UserManagement />
        ) : currentView === 'domains' ? (
          <DomainManagement />
        ) : null}
      </Layout>

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