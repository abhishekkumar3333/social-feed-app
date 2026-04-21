import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { UserPlus, UserMinus, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import PostCard from '../features/feed/PostCard';

const Profile = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data } = await client.get(`/users/${id}`);
      return data;
    }
  });

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', id],
    queryFn: async () => {
      const { data } = await client.get(`/posts/user/${id}`);
      return data;
    }
  });

  const followMutation = useMutation({
    mutationFn: (isFollow) => client.post(`/users/${id}/${isFollow ? 'follow' : 'unfollow'}`),
    onSuccess: () => queryClient.invalidateQueries(['profile', id])
  });

  if (isProfileLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand" /></div>;

  const { user, isFollowing, stats } = profile;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      <div className="premium-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand to-purple-500" />
        <div className="px-8 pb-8 relative">
          <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-900 overflow-hidden -mt-16 bg-slate-200">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-4 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-slate-500">{user.email}</p>
            </div>

            <button
              onClick={() => followMutation.mutate(!isFollowing)}
              disabled={followMutation.isPending}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 ${isFollowing
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'bg-brand text-white'
                }`}
            >
              {isFollowing ? <><UserMinus size={18} /> Unfollow</> : <><UserPlus size={18} /> Follow</>}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 text-slate-500 text-sm">
            <Calendar size={16} />
            <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
          </div>

          <div className="flex gap-8 mt-8 border-t dark:border-slate-800 pt-8">
            <div className="text-center">
              <span className="block text-2xl font-black">{stats.followersCount}</span>
              <span className="text-sm text-slate-500 uppercase tracking-widest font-bold">Followers</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black">{stats.followingCount}</span>
              <span className="text-sm text-slate-500 uppercase tracking-widest font-bold">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold px-2">Posts</h2>
        {isPostsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" /></div>
        ) : posts?.length === 0 ? (
          <div className="premium-card p-10 text-center text-slate-500">
            No posts found.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} status={post.status} />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
