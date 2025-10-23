import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Home,
  List,
  Table,
  Settings,
  HelpCircle,
  Menu,
  X,
  User,
  Users,
  Rss,
  Globe,
  FileText,
  LogOut,
  ChevronDown,
  BarChart3,
  Share2,
  Edit3,
  Layers,
  Send,
  Search
} from 'lucide-react';
import Button from './ui/Button';
import { cn, getStoredValue, setStoredValue } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ViewType } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => 
    getStoredValue('darkMode', window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setStoredValue('darkMode', newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize dark mode on mount
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      key: 'new-dashboard' as const,
      icon: Home,
      current: currentView === 'new-dashboard',
    },
    {
      section: 'APPS',
      items: [
        {
          name: 'Articles',
          key: 'article-list-page' as const,
          icon: FileText,
          current: currentView === 'article-list-page',
        },
        {
          name: 'Feed Sources',
          key: 'feeds' as const,
          icon: Rss,
          current: currentView === 'feeds',
        },
        {
          name: 'Master Content',
          key: 'master-content' as const,
          icon: Edit3,
          current: currentView === 'master-content',
        },
        {
          name: 'Social Platforms',
          key: 'social-platforms' as const,
          icon: Send,
          current: currentView === 'social-platforms',
        },
        {
          name: 'Content Adaptation',
          key: 'content-adaptation' as const,
          icon: Layers,
          current: currentView === 'content-adaptation',
        },
      ]
    },
    // Only show admin features for admins
    ...(user?.role === 'ADMIN' ? [{
      section: 'PAGES',
      items: [
        {
          name: 'User Management',
          key: 'user-management' as const,
          icon: Users,
          current: currentView === 'user-management',
        },
        {
          name: 'Domain Management',
          key: 'domains' as const,
          icon: Globe,
          current: currentView === 'domains',
        },
        {
          name: 'N8N Overview',
          key: 'new-social-media-accounts' as const,
          icon: Share2,
          current: currentView === 'new-social-media-accounts',
        },
        {
          name: 'Config Properties',
          key: 'config-properties' as const,
          icon: Settings,
          current: currentView === 'config-properties',
        }
      ]
    }] : []),
    {
      section: 'COMPONENTS',
      items: [
        {
          name: 'Account',
          key: 'account' as const,
          icon: User,
          current: currentView === 'account',
        }
      ]
    }
  ];

  const shortcuts = [
    { key: 'j/k', description: 'Navigate up/down' },
    { key: 'a', description: 'Accept current/selected' },
    { key: 'r', description: 'Reject current/selected' },
    { key: 'd', description: 'Show details' },
    { key: 'x', description: 'Toggle selection' },
    { key: 'Shift + A', description: 'Select/deselect all' },
    { key: 'Escape', description: 'Clear selection' },
    { key: '?', description: 'Show this help' },
  ];

  // Keyboard shortcut to show help
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.contentEditable === 'true'
        ) {
          return;
        }
        
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-user-dropdown]')) {
          setUserDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Skote-style Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Skote Logo Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-gray-900">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="skote-card-title font-semibold text-white font-primary">
                FlowCraft
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-700 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Skote-style Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {navigation.map((item, index) => {
              // Render single item (Dashboard)
              if (item.key) {
                const IconComponent = item.icon as React.ComponentType<{ className?: string }>;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onViewChange(item.key as ViewType);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center px-4 py-3 skote-nav-text rounded-md transition-colors mb-1',
                      item.current
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                );
              }

              // Render section with items
              if (item.section) {
                return (
                  <div key={`section-${index}`} className="mb-6">
                    <div className="px-4 mb-3">
                      <h3 className="skote-small-text font-semibold text-gray-500 uppercase tracking-wider">
                        {item.section}
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {item.items.map((subItem) => {
                        const SubIconComponent = subItem.icon as React.ComponentType<{ className?: string }>;
                        return (
                          <button
                            key={subItem.key}
                            onClick={() => {
                              onViewChange(subItem.key as ViewType);
                              setSidebarOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center px-4 py-2 skote-nav-text rounded-md transition-colors',
                              subItem.current
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            )}
                          >
                            <SubIconComponent className="w-4 h-4 mr-3" />
                            {subItem.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </nav>

          {/* Skote Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-center">
              <p className="skote-small-text text-gray-500">
                2024 © FlowCraft. Crafted with ❤️ by N8N Automation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Skote Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="px-6 flex items-center justify-between h-full">
            {/* Left side - Mobile menu and search */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search Bar */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 skote-body-text"
                  placeholder="Search..."
                  type="search"
                />
              </div>
            </div>

            {/* Right side - Icons and User */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                  <Globe className="w-5 h-5" />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md relative">
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="skote-small-text text-white font-medium">3</span>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5zm0 0V8a6 6 0 10-12 0v9h12z" />
                </svg>
              </button>

              {/* User Profile */}
              {user && (
                <div className="relative" data-user-dropdown>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="skote-nav-text text-gray-900">{user.username}</div>
                      <div className="skote-small-text text-gray-500 capitalize">{user.role}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* User Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="skote-nav-text text-gray-900">{user.username}</p>
                          <p className="skote-small-text text-gray-500">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            onViewChange('account');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 skote-body-text text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </button>
                        <button
                          onClick={() => setShowShortcuts(true)}
                          className="w-full text-left px-4 py-2 skote-body-text text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Help & Shortcuts
                        </button>
                        <div className="border-t border-gray-200"></div>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 skote-body-text text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="skote-heading-3 text-gray-900 dark:text-gray-100">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between">
                    <span className="skote-body-text text-gray-600 dark:text-gray-400">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 skote-small-text font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}