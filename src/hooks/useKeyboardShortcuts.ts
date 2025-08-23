import { useEffect, useCallback } from 'react';
import { KeyboardShortcut } from '@/types';
import { getKeyCombo, isModifierKey } from '@/lib/utils';

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in form elements
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    const keyCombo = getKeyCombo(event);
    
    // Find matching shortcut
    const shortcut = shortcuts.find(s => s.key.toLowerCase() === keyCombo);
    
    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.handler();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export function useNavigationShortcuts(
  items: any[],
  selectedIndex: number,
  onIndexChange: (index: number) => void,
  onActivate: (index: number) => void
) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'j',
      action: 'move-down',
      description: 'Move to next item',
      handler: () => {
        const nextIndex = Math.min(selectedIndex + 1, items.length - 1);
        onIndexChange(nextIndex);
      },
    },
    {
      key: 'k',
      action: 'move-up',
      description: 'Move to previous item',
      handler: () => {
        const prevIndex = Math.max(selectedIndex - 1, 0);
        onIndexChange(prevIndex);
      },
    },
    {
      key: 'enter',
      action: 'activate',
      description: 'Activate current item',
      handler: () => {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          onActivate(selectedIndex);
        }
      },
    },
    {
      key: 'home',
      action: 'first',
      description: 'Go to first item',
      handler: () => {
        if (items.length > 0) {
          onIndexChange(0);
        }
      },
    },
    {
      key: 'end',
      action: 'last',
      description: 'Go to last item',
      handler: () => {
        if (items.length > 0) {
          onIndexChange(items.length - 1);
        }
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

export function useArticleReviewShortcuts(
  selectedArticles: number[],
  currentArticleIndex: number,
  articles: any[],
  onSelectArticle: (id: number) => void,
  onAcceptArticle: (id: number) => void,
  onRejectArticle: (id: number) => void,
  onShowDetails: (article: any) => void,
  onSelectAll: () => void,
  onClearSelection: () => void,
  onBulkAccept: () => void,
  onBulkReject: () => void
) {
  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'j',
      action: 'next-article',
      description: 'Move to next article',
      handler: () => {
        const nextIndex = Math.min(currentArticleIndex + 1, articles.length - 1);
        if (articles[nextIndex]) {
          onSelectArticle(articles[nextIndex].id);
        }
      },
    },
    {
      key: 'k',
      action: 'prev-article',
      description: 'Move to previous article',
      handler: () => {
        const prevIndex = Math.max(currentArticleIndex - 1, 0);
        if (articles[prevIndex]) {
          onSelectArticle(articles[prevIndex].id);
        }
      },
    },
    
    // Selection
    {
      key: 'x',
      action: 'toggle-select',
      description: 'Toggle selection of current article',
      handler: () => {
        if (articles[currentArticleIndex]) {
          onSelectArticle(articles[currentArticleIndex].id);
        }
      },
    },
    {
      key: 'shift+a',
      action: 'select-all',
      description: 'Select/deselect all articles',
      handler: onSelectAll,
    },
    {
      key: 'escape',
      action: 'clear-selection',
      description: 'Clear all selections',
      handler: onClearSelection,
    },
    
    // Actions on current article
    {
      key: 'a',
      action: 'accept-current',
      description: 'Accept current article',
      handler: () => {
        if (selectedArticles.length > 0) {
          onBulkAccept();
        } else if (articles[currentArticleIndex]) {
          onAcceptArticle(articles[currentArticleIndex].id);
        }
      },
    },
    {
      key: 'r',
      action: 'reject-current',
      description: 'Reject current article',
      handler: () => {
        if (selectedArticles.length > 0) {
          onBulkReject();
        } else if (articles[currentArticleIndex]) {
          onRejectArticle(articles[currentArticleIndex].id);
        }
      },
    },
    {
      key: 'd',
      action: 'show-details',
      description: 'Show article details',
      handler: () => {
        if (articles[currentArticleIndex]) {
          onShowDetails(articles[currentArticleIndex]);
        }
      },
    },
    {
      key: 'enter',
      action: 'open-details',
      description: 'Open article details',
      handler: () => {
        if (articles[currentArticleIndex]) {
          onShowDetails(articles[currentArticleIndex]);
        }
      },
    },
    
    // Bulk actions
    {
      key: 'shift+enter',
      action: 'bulk-accept',
      description: 'Accept all selected articles',
      handler: () => {
        if (selectedArticles.length > 0) {
          onBulkAccept();
        }
      },
    },
    {
      key: 'shift+delete',
      action: 'bulk-reject',
      description: 'Reject all selected articles',
      handler: () => {
        if (selectedArticles.length > 0) {
          onBulkReject();
        }
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
  
  return shortcuts;
}