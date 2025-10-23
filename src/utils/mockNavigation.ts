import { useNavigation } from '@/contexts/NavigationContext';
import { ViewType } from '@/types';

// Navigation helper that works with our view system
export function useMockNavigate() {
  const { setCurrentView } = useNavigation();

  return (path: string) => {
    console.log('Navigate to:', path);

    // Handle article-details with query parameters
    if (path.startsWith('/article-details')) {
      const url = new URL(path, window.location.origin);
      const articleId = url.searchParams.get('id');

      if (articleId) {
        // Store the article ID in URL for the details page to pick up
        const newUrl = `${window.location.pathname}${window.location.search}#article-details?id=${articleId}`;
        window.history.pushState({}, '', newUrl);
      }

      setCurrentView('article-details' as ViewType);
      return;
    }

    // Map other paths to views
    const pathToView: Record<string, ViewType> = {
      '/dashboard': 'new-dashboard',
      '/article-list': 'article-list-page',
      '/user-management': 'user-management',
      '/post-creation': 'post-creation',
      '/social-media-management': 'social-media-management'
    };

    const view = pathToView[path];
    if (view) {
      setCurrentView(view);
    } else {
      console.warn('Unknown path:', path);
    }
  };
}