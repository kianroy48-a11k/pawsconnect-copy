import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/feed/PostCard';
import { Bookmark, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Saved({ user }) {
  const queryClient = useQueryClient();
  const [userLikes, setUserLikes] = useState([]);

  // Fetch saved posts
  const { data: savedPosts = [], isLoading } = useQuery({
    queryKey: ['saved-posts', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const savedItems = await base44.entities.SavedPost.filter({ user_email: user.email });
      const postIds = savedItems.map(s => s.post_id);
      
      if (postIds.length === 0) return [];
      
      const allPosts = await base44.entities.Post.list('-created_date', 100);
      return allPosts.filter(post => postIds.includes(post.id));
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (user?.email) {
      loadUserLikes();
    }
  }, [user?.email]);

  const loadUserLikes = async () => {
    try {
      const likes = await base44.entities.Like.filter({ user_email: user.email });
      setUserLikes(likes.map(l => l.post_id));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please sign in to view saved posts</p>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] border-r border-gray-100 min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Saved Posts</h1>
        </div>
      </header>

      {isLoading ? (
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-orange-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved posts yet</h2>
          <p className="text-gray-500 max-w-sm">
            When you save posts, they'll appear here so you can easily find them later.
          </p>
        </div>
      ) : (
        savedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserEmail={user?.email}
            userLikes={userLikes}
            onLikeUpdate={loadUserLikes}
            onDelete={() => queryClient.invalidateQueries({ queryKey: ['saved-posts'] })}
          />
        ))
      )}
    </div>
  );
}