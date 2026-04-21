import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Share2, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post, status = 'approved' }) => {
  const author = post.author;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const likeMutation = useMutation({
    mutationFn: () => client.post(`/posts/${post._id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
      queryClient.invalidateQueries(['user-posts']);
    }
  });

  const followMutation = useMutation({
    mutationFn: () => client.post(`/users/${author._id}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    }
  });

  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-500', label: 'Under Review', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    approved: { icon: CheckCircle, color: 'text-emerald-500', label: 'Approved', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected', bg: 'bg-red-50 dark:bg-red-900/20' },
  };

  const currentStatus = statusConfig[status];
  const Icon = currentStatus?.icon;



  return (
    <article className="premium-card p-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username || author?.name || 'default'}`} 
              alt={author?.username || author?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-50">{author?.displayName || author?.username || author?.name}</h3>
              {user && author && user._id !== author._id && (
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all border ${
                    author.isFollowing 
                      ? 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'border-brand text-brand hover:bg-brand/10'
                  } ${followMutation.isPending ? 'opacity-50' : ''}`}
                >
                  {followMutation.isPending ? '...' : (author.isFollowing ? 'Following' : 'Follow')}
                </button>
              )}
            </div>
            <span className="text-sm text-slate-500">
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </span>
          </div>
        </div>

        {status !== 'approved' && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.bg} ${currentStatus.color}`}>
            <Icon size={14} />
            <span>{currentStatus.label}</span>
          </div>
        )}
      </div>

      <p className="text-slate-800 dark:text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.image && (
        <div className="mb-6 rounded-2xl overflow-hidden border dark:border-slate-800">
          <img 
            src={`http://localhost:5000${post.image}`} 
            alt="Post content" 
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-800 pt-4">
        <button 
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-2 transition-colors group ${
            likeMutation.isPending ? 'opacity-50' : ''
          } ${post.isLiked ? 'text-red-500' : 'text-slate-500'}`}
        >
          <div className={`p-2 rounded-full transition-all ${
            post.isLiked ? 'bg-red-50 dark:bg-red-900/20' : 'group-hover:bg-red-50 dark:group-hover:bg-red-900/20'
          }`}>
            <Heart size={18} className={`${post.isLiked ? 'fill-current' : ''} ${likeMutation.isPending ? 'animate-pulse' : ''}`} />
          </div>
          <span className="text-sm font-medium">{post.likesCount || 0}</span>
        </button>

        <button className="flex items-center gap-2 text-slate-500 hover:text-brand transition-colors group ml-auto">
          <div className="p-2 rounded-full group-hover:bg-brand/10 dark:group-hover:bg-brand/20 transition-all">
            <Share2 size={18} />
          </div>
        </button>
      </div>
    </article>
  );
};

export default PostCard;
