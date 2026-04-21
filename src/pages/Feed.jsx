import React, { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import client from '../api/client';
import CreatePost from '../features/feed/CreatePost';
import PostCard from '../features/feed/PostCard';
import { Loader2, Zap } from 'lucide-react';

const Feed = () => {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = null }) => {
      const params = pageParam ? 
        `?lastScore=${pageParam.score}&lastId=${pageParam.id}` : '';
      const { data } = await client.get(`/feed${params}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined;
      const lastItem = lastPage[lastPage.length - 1];
      return { score: lastItem.score, id: lastItem._id };
    },
    initialPageParam: null,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand" size={40} /></div>;

  return (
    <div className="space-y-6">
      <CreatePost />
      
      <div className="space-y-4">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.map((item) => (
              <PostCard 
                key={item._id} 
                post={item.post || item} 
                status={item.post?.status || 'approved'} 
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <div ref={ref} className="h-20 flex justify-center items-center">
        {isFetchingNextPage ? (
          <Loader2 className="animate-spin text-brand" />
        ) : hasNextPage ? (
          <span className="text-slate-400 text-sm">Loading more posts...</span>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 opacity-50">
            <Zap size={24} className="text-yellow-500" />
            <p className="text-sm font-bold uppercase tracking-widest">You're all caught up</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
