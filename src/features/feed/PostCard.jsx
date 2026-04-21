import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Share2, Clock, CheckCircle, XCircle, Loader2, Trash2, MessageCircle, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post, status = 'approved' }) => {
  const author = post.author;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

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

  const deleteMutation = useMutation({
    mutationFn: () => client.delete(`/posts/${post._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content) => client.post(`/posts/${post._id}/comment`, { content }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    }
  });

  const canDelete = user && author && (user._id === author._id || user.role === 'admin');

  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-500', label: 'Under Review', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    approved: { icon: CheckCircle, color: 'text-emerald-500', label: 'Approved', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected', bg: 'bg-red-50 dark:bg-red-900/20' },
  };

  const currentStatus = statusConfig[status];
  const Icon = currentStatus?.icon;

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

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

        <div className="flex items-center gap-3">
          {status !== 'approved' && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.bg} ${currentStatus.color}`}>
              <Icon size={14} />
              <span>{currentStatus.label}</span>
            </div>
          )}
          {canDelete && (
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this post?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all disabled:opacity-50"
              title="Delete Post"
            >
              {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          )}
        </div>
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

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-brand' : 'text-slate-500'}`}
        >
          <div className={`p-2 rounded-full transition-all ${showComments ? 'bg-brand/10' : 'group-hover:bg-brand/10'}`}>
            <MessageCircle size={18} />
          </div>
          <span className="text-sm font-medium">{post.commentsCount || 0}</span>
        </button>

        <button className="flex items-center gap-2 text-slate-500 hover:text-brand transition-colors group ml-auto">
          <div className="p-2 rounded-full group-hover:bg-brand/10 dark:group-hover:bg-brand/20 transition-all">
            <Share2 size={18} />
          </div>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t dark:border-slate-800 animate-in slide-in-from-top-2">
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
            {post.recentComments?.length > 0 ? (
              post.recentComments.map((comment) => (
                <div key={comment._id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 transition-all">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name || comment.authorId?.username}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{comment.user?.name || comment.authorId?.username}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-500 py-2">No comments yet. Be the first!</p>
            )}
          </div>

          <form onSubmit={handleComment} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Write a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button 
              type="submit" 
              disabled={commentMutation.isPending || !commentText.trim()}
              className="p-2 bg-brand text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition-all font-bold flex items-center justify-center shrink-0"
            >
              {commentMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export default PostCard;
