import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ArticleCategory, Priority, TargetAudience } from '@/types';

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Score-related utilities
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-score-high';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-500';
  return 'text-score-low';
}

export function getScoreBackgroundColor(score: number): string {
  if (score >= 80) return 'bg-score-high';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-score-low';
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-green-400 to-green-600';
  if (score >= 60) return 'from-yellow-400 to-yellow-600';
  if (score >= 40) return 'from-orange-400 to-orange-600';
  return 'from-red-400 to-red-600';
}

// Priority-related utilities
export function getPriorityColor(priority: Priority): string {
  const colors = {
    P0_BREAKING: 'text-priority-p0',
    P1_TRENDING: 'text-priority-p1',
    P2_TIMELY: 'text-priority-p2',
    P3_EVERGREEN: 'text-priority-p3',
    P4_FILLER: 'text-priority-p4',
  };
  return colors[priority];
}

export function getPriorityBadgeColor(priority: Priority): string {
  const colors = {
    P0_BREAKING: 'bg-priority-p0 text-white',
    P1_TRENDING: 'bg-priority-p1 text-white',
    P2_TIMELY: 'bg-priority-p2 text-white',
    P3_EVERGREEN: 'bg-priority-p3 text-white',
    P4_FILLER: 'bg-priority-p4 text-white',
  };
  return colors[priority];
}

export function getPriorityLabel(priority: Priority): string {
  const labels = {
    P0_BREAKING: 'Breaking',
    P1_TRENDING: 'Trending',
    P2_TIMELY: 'Timely',
    P3_EVERGREEN: 'Evergreen',
    P4_FILLER: 'Filler',
  };
  return labels[priority];
}

// Category-related utilities
export function getCategoryColor(category: ArticleCategory): string {
  const colors = {
    AI_ML: 'text-category-ai',
    WEB_DEV: 'text-category-web',
    MOBILE_DEV: 'text-category-mobile',
    DATA_SCIENCE: 'text-category-data',
    DEVOPS: 'text-category-devops',
    SECURITY: 'text-category-security',
    CLOUD: 'text-blue-500',
    BLOCKCHAIN: 'text-purple-500',
    IOT: 'text-green-500',
    OTHER: 'text-gray-500',
  };
  return colors[category];
}

export function getCategoryBadgeColor(category: ArticleCategory): string {
  const colors = {
    AI_ML: 'bg-category-ai text-white',
    WEB_DEV: 'bg-category-web text-white',
    MOBILE_DEV: 'bg-category-mobile text-white',
    DATA_SCIENCE: 'bg-category-data text-white',
    DEVOPS: 'bg-category-devops text-white',
    SECURITY: 'bg-category-security text-white',
    CLOUD: 'bg-blue-500 text-white',
    BLOCKCHAIN: 'bg-purple-500 text-white',
    IOT: 'bg-green-500 text-white',
    OTHER: 'bg-gray-500 text-white',
  };
  return colors[category];
}

export function getCategoryLabel(category: ArticleCategory): string {
  const labels = {
    AI_ML: 'AI/ML',
    WEB_DEV: 'Web Dev',
    MOBILE_DEV: 'Mobile',
    DATA_SCIENCE: 'Data Science',
    DEVOPS: 'DevOps',
    SECURITY: 'Security',
    CLOUD: 'Cloud',
    BLOCKCHAIN: 'Blockchain',
    IOT: 'IoT',
    OTHER: 'Other',
  };
  return labels[category];
}

// Target audience utilities
export function getAudienceLabel(audience: TargetAudience): string {
  const labels = {
    developers: 'Developers',
    architects: 'Architects',
    managers: 'Managers',
    beginners: 'Beginners',
    experts: 'Experts',
    mixed: 'Mixed',
  };
  return labels[audience];
}

export function getAudienceBadgeColor(audience: TargetAudience): string {
  const colors = {
    developers: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    architects: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    managers: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    beginners: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    experts: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    mixed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  return colors[audience];
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return `Today at ${format(date, 'HH:mm')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`;
  }
  
  return format(date, 'MMM dd, yyyy');
}

export function formatRelativeDate(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

// URL utilities
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return url;
  }
}

// Array utilities
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// Local storage utilities
export function getStoredValue<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setStoredValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
}

// Keyboard utilities
export function isModifierKey(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
}

export function getKeyCombo(event: KeyboardEvent): string {
  const modifiers: string[] = [];
  
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.metaKey) modifiers.push('meta');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  
  return [...modifiers, event.key.toLowerCase()].join('+');
}