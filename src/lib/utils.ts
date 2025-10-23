import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy');
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// Category utilities
export function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    'technology': 'bg-blue-100 text-blue-800',
    'business': 'bg-green-100 text-green-800',
    'science': 'bg-purple-100 text-purple-800',
    'health': 'bg-red-100 text-red-800',
    'sports': 'bg-orange-100 text-orange-800',
    'entertainment': 'bg-pink-100 text-pink-800',
    'politics': 'bg-gray-100 text-gray-800',
    'general': 'bg-gray-100 text-gray-800'
  };
  return colors[category.toLowerCase()] || colors['general'];
}

export function getCategoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// Priority utilities
export function getPriorityBadgeColor(priority: string): string {
  const colors: Record<string, string> = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800'
  };
  return colors[priority.toLowerCase()] || colors['medium'];
}

export function getPriorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// Audience utilities
export function getAudienceBadgeColor(audience: string): string {
  const colors: Record<string, string> = {
    'general': 'bg-gray-100 text-gray-800',
    'technical': 'bg-blue-100 text-blue-800',
    'business': 'bg-green-100 text-green-800',
    'academic': 'bg-purple-100 text-purple-800'
  };
  return colors[audience.toLowerCase()] || colors['general'];
}

export function getAudienceLabel(audience: string): string {
  return audience.charAt(0).toUpperCase() + audience.slice(1);
}

// Domain extraction utility
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Score utilities
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreBackgroundColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}

// Local storage utilities
export function getStoredValue<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStoredValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

// Keyboard shortcut utilities
export function getKeyCombo(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  if (event.metaKey) parts.push('Meta');

  const key = event.key;
  if (!isModifierKey(key)) {
    parts.push(key.toUpperCase());
  }

  return parts.join('+');
}

export function isModifierKey(key: string): boolean {
  return ['Control', 'Alt', 'Shift', 'Meta'].includes(key);
}

// Text truncation utility
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
