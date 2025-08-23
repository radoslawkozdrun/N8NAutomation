import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ArticleList } from '@/components/ArticleList';
import { AllArticles } from '@/components/AllArticles';
import { ArticleDetailModal } from '@/components/ArticleDetailModal';
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

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'articles' | 'all-articles'>('dashboard');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewArticles = () => {
    setCurrentView('articles');
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedArticle(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Layout currentView={currentView} onViewChange={setCurrentView}>
          {currentView === 'dashboard' ? (
            <Dashboard onViewArticles={handleViewArticles} />
          ) : currentView === 'articles' ? (
            <ArticleList onArticleSelect={handleArticleSelect} />
          ) : (
            <AllArticles />
          )}
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
    </QueryClientProvider>
  );
}

export default App;