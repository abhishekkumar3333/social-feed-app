import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { Bell, Heart, UserPlus, MessageCircle, AlertCircle, Loader2, CheckCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const IconMap = {
  like: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  comment: { icon: MessageCircle, color: 'text-brand', bg: 'bg-brand/10' },
  follow: { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' },
  post_approved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  post_rejected: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
};

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await client.get('/notifications');
      return response.data;
    }
  });

  const markAllRead = useMutation({
    mutationFn: () => client.patch('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand" size={40} /></div>;

  // Batched Notifications Logic
  const getBatchedNotifications = (notifications) => {
    const batches = [];
    const processed = new Set();

    notifications.forEach((notif, index) => {
      if (processed.has(index)) return;

      // Only batch Likes and Follows for now
      if (notif.type === 'like' && notif.postId) {
        const similar = notifications.filter((n, i) => 
          !processed.has(i) && 
          n.type === 'like' && 
          n.postId?._id === notif.postId._id
        );

        if (similar.length > 1) {
          batches.push({
            ...notif,
            isBatch: true,
            count: similar.length,
            actors: similar.map(s => s.actorId).filter(a => a)
          });
          similar.forEach(s => processed.add(notifications.indexOf(s)));
          return;
        }
      }
      
      batches.push(notif);
      processed.add(index);
    });

    return batches;
  };

  const batches = getBatchedNotifications(data || []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button 
          onClick={() => markAllRead.mutate()}
          className="text-sm font-bold text-brand hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {batches.length === 0 ? (
          <div className="premium-card p-12 text-center text-slate-500">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          batches.map((notif) => {
            const config = IconMap[notif.type] || IconMap.post_rejected;
            const Icon = config.icon;
            
            return (
              <div key={notif._id} className={`premium-card p-4 flex items-start gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.read ? 'border-l-4 border-l-brand' : ''}`}>
                <div className={`p-2.5 rounded-xl ${config.bg} ${config.color}`}>
                  <Icon size={20} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {notif.isBatch ? (
                      <div className="flex -space-x-2">
                         {notif.actors.slice(0, 3).map((actor, i) => (
                           <img key={i} src={actor.avatarUrl} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="" />
                         ))}
                      </div>
                    ) : (
                      <img src={notif.actorId?.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                    )}
                    <p className="text-sm">
                      <span className="font-bold">
                        {notif.isBatch 
                          ? `${notif.actorId?.displayName} and ${notif.count - 1} others` 
                          : notif.actorId?.displayName || 'System'}
                      </span>
                      {' '}
                      {notif.type === 'like' && 'liked your post'}
                      {notif.type === 'comment' && 'commented on your post'}
                      {notif.type === 'follow' && 'started following you'}
                      {notif.type === 'post_approved' && 'Your post was approved!'}
                      {notif.type === 'post_rejected' && 'Your post was rejected.'}
                    </p>
                  </div>
                  
                  {notif.postId?.content && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                      "{notif.postId.content}"
                    </p>
                  )}
                  
                  <span className="text-[10px] text-slate-400 mt-2 block uppercase font-bold tracking-tighter">
                    {formatDistanceToNow(new Date(notif.createdAt))} ago
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
