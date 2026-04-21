import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import PostCard from '../features/feed/PostCard';
import { Loader2, Compass } from 'lucide-react';

const Explore = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['explore'],
    queryFn: async () => {
      const { data } = await client.get('/feed/explore');
      return data;
    }
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand to-purple-500 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><Compass className="animate-pulse" /> Explore Trending</h2>
          <p className="text-white/80 max-w-md text-sm leading-relaxed">
            Discover the highest quality content curated just for you. From top posts to hot topics.
          </p>
        </div>
        <div className="absolute -top-10 -right-10 p-4 opacity-10">
          <Compass size={200} />
        </div>
      </div>

      <div className="space-y-4">
        {posts?.map((post) => (
          <PostCard key={post._id} post={post} status={post.status || 'approved'} />
        ))}
        {posts?.length === 0 && (
          <div className="text-center p-10 text-slate-500 italic">No posts found in Explore yet.</div>
        )}
      </div>
    </div>
  );
};

export default Explore;
