import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Calendar,
  MessageSquare,
  Share2,
  Hash,
  User,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  content_item_id: number;
  title: string;
  content_body: string;
  platform: string;
  hashtags?: string[];
  status: 'DRAFT_CREATED' | 'PENDING_REVIEW' | 'NEEDS_REVISION' | 'APPROVED_FOR_PUBLISHING' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'ARCHIVED';
  published_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Legacy fields for compatibility
  content?: string;
  ai_generated?: boolean;
  source_article_id?: number;
  reviewed_by?: number;
  scheduled_publish_date?: string;
  published_date?: string;
  rejection_reason?: string;
  metadata?: any;
  reviewed_at?: string;
  created_by_username?: string;
  reviewed_by_username?: string;
}

export function PostReview() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'PENDING_REVIEW' | 'APPROVED_FOR_PUBLISHING' | 'NEEDS_REVISION'>('PENDING_REVIEW');

  // Load posts from API
  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8002/api/posts?status=${filter === 'all' ? '' : filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        toast.error('Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8002/api/posts/${postId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Post approved successfully');
        loadPosts();
      } else {
        toast.error('Failed to approve post');
      }
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error('Error approving post');
    }
  };

  const handleReject = async (postId: number, reason: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8002/api/posts/${postId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Post rejected');
        setShowRejectionModal(false);
        setRejectionReason('');
        setSelectedPost(null);
        loadPosts();
      } else {
        toast.error('Failed to reject post');
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast.error('Error rejecting post');
    }
  };

  const openRejectionModal = (post: Post) => {
    setSelectedPost(post);
    setShowRejectionModal(true);
    setRejectionReason('');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'twitter':
        return '🐦';
      case 'linkedin':
        return '💼';
      case 'instagram':
        return '📷';
      default:
        return '📱';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT_CREATED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'PENDING_REVIEW':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'APPROVED_FOR_PUBLISHING':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NEEDS_REVISION':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'SCHEDULED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'PUBLISHING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PUBLISHED':
      case 'published':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT_CREATED':
        return 'Draft Created';
      case 'PENDING_REVIEW':
        return 'Pending Review';
      case 'APPROVED_FOR_PUBLISHING':
        return 'Approved';
      case 'NEEDS_REVISION':
        return 'Needs Revision';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'PUBLISHING':
        return 'Publishing';
      case 'PUBLISHED':
        return 'Published';
      case 'FAILED':
        return 'Failed';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Post Review Dashboard
        </h1>
        
        {/* Filter buttons */}
        <div className="flex space-x-2">
          {([
            { key: 'all', label: 'All' },
            { key: 'PENDING_REVIEW', label: 'Pending Review' },
            { key: 'APPROVED_FOR_PUBLISHING', label: 'Approved' },
            { key: 'NEEDS_REVISION', label: 'Needs Revision' }
          ] as const).map((status) => (
            <button
              key={status.key}
              onClick={() => setFilter(status.key as any)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === status.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No posts found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'PENDING_REVIEW' ? 'No posts are waiting for review.' : `No ${filter === 'APPROVED_FOR_PUBLISHING' ? 'approved' : filter === 'NEEDS_REVISION' ? 'posts needing revision' : filter.toLowerCase()} posts found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{post.platform.charAt(0).toUpperCase() + post.platform.slice(1).toLowerCase()}</span>
                      <span>•</span>
                      <span>{formatDate(post.created_at)}</span>
                      {post.created_by && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {post.created_by}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(post.status))}>
                  {formatStatusText(post.status)}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {(post.content_body || post.content || '').split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2 last:mb-0">
                      {paragraph.split(/(#\w+)/g).map((part, partIndex) => 
                        part.startsWith('#') ? (
                          <span key={partIndex} className="text-blue-600 dark:text-blue-400 font-medium">
                            {part}
                          </span>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>
                
                {(post.hashtags || post.metadata?.hashtags) && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {(post.hashtags || post.metadata?.hashtags).join(' ')}
                    </span>
                  </div>
                )}

                {(post.published_at || post.scheduled_publish_date) && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {post.published_at ? `Published: ${formatDate(post.published_at)}` : `Scheduled: ${formatDate(post.scheduled_publish_date!)}`}
                    </span>
                  </div>
                )}

                {post.rejection_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-3">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Rejection reason:</strong> {post.rejection_reason}
                    </p>
                  </div>
                )}
              </div>

              {post.status === 'PENDING_REVIEW' && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Awaiting review</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => openRejectionModal(post)}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(post.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              )}

              {post.status !== 'PENDING_REVIEW' && post.reviewed_at && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>
                      Reviewed {post.reviewed_by_username ? `by ${post.reviewed_by_username}` : ''} on {formatDate(post.reviewed_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Reject Post
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this post:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                    setSelectedPost(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReject(selectedPost.id, rejectionReason)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={!rejectionReason.trim()}
                >
                  Reject Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}