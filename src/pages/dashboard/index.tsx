import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Activity,
  DollarSign,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('today');

  // Sample data - in real app this would come from API
  const stats = [
    {
      title: 'Total Articles',
      value: '2,456',
      change: '+5.4%',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Pending Review',
      value: '45',
      change: '-2.1%',
      trend: 'down',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Accepted Today',
      value: '28',
      change: '+8.2%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Average AI Score',
      value: '87.5',
      change: '+1.2%',
      trend: 'up',
      icon: Star,
      color: 'purple'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Article accepted',
      article: 'React 18 Concurrent Features Guide',
      user: 'John Doe',
      time: '2 minutes ago',
      type: 'success'
    },
    {
      id: 2,
      action: 'New article submitted',
      article: 'Vue 3 Composition API Best Practices',
      user: 'Jane Smith',
      time: '15 minutes ago',
      type: 'info'
    },
    {
      id: 3,
      action: 'Article rejected',
      article: 'Outdated jQuery Techniques',
      user: 'Mike Johnson',
      time: '1 hour ago',
      type: 'error'
    },
    {
      id: 4,
      action: 'Article needs review',
      article: 'TypeScript 5.0 New Features',
      user: 'Sarah Wilson',
      time: '2 hours ago',
      type: 'warning'
    }
  ];

  const topPerformingArticles = [
    {
      id: 1,
      title: 'Advanced React Patterns and Performance',
      score: 95.8,
      views: '12.4k',
      status: 'Published'
    },
    {
      id: 2,
      title: 'Node.js Security Best Practices 2024',
      score: 92.3,
      views: '8.7k',
      status: 'Published'
    },
    {
      id: 3,
      title: 'Modern CSS Layout Techniques',
      score: 89.1,
      views: '6.2k',
      status: 'Published'
    },
    {
      id: 4,
      title: 'Database Optimization Strategies',
      score: 87.5,
      views: '4.8k',
      status: 'Published'
    }
  ];

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? ArrowUpRight : ArrowDownRight;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'error': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="skote-page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of system performance and activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = getTrendIcon(stat.trend);

          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="skote-body-text font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="skote-page-title font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className={`flex items-center mt-2 skote-body-text ${getTrendColor(stat.trend)}`}>
                    <TrendIcon className="w-4 h-4 mr-1" />
                    <span>{stat.change} from last period</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatColor(stat.color)}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="skote-card-title">Article Performance</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 skote-body-text text-blue-600 bg-blue-50 rounded-md">Weekly</button>
              <button className="px-3 py-1 skote-body-text text-gray-500 hover:text-gray-700">Monthly</button>
              <button className="px-3 py-1 skote-body-text text-gray-500 hover:text-gray-700">Yearly</button>
            </div>
          </div>

          {/* Placeholder for chart */}
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization would be here</p>
              <p className="skote-body-text text-gray-400">Integration with Chart.js or Recharts</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="skote-card-title mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityIcon(activity.type)}`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="skote-body-text font-medium text-gray-900">{activity.action}</p>
                  <p className="skote-body-text text-gray-500 truncate">{activity.article}</p>
                  <p className="skote-small-text text-gray-400">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="w-full text-center skote-body-text text-blue-600 hover:text-blue-700 font-medium">
              View all activity
            </button>
          </div>
        </div>
      </div>

      {/* Top Performing Articles */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="skote-card-title">Top Performing Articles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left skote-small-text font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left skote-small-text font-medium text-gray-500 uppercase tracking-wider">
                  AI Score
                </th>
                <th className="px-6 py-3 text-left skote-small-text font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left skote-small-text font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center skote-small-text font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformingArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="skote-body-text font-medium text-gray-900">{article.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="skote-body-text font-medium text-gray-900 mr-2">{article.score}</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${article.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap skote-body-text text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {article.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full skote-small-text font-medium bg-green-100 text-green-800">
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center skote-body-text font-medium">
                    <button className="text-blue-600 hover:text-blue-900 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;