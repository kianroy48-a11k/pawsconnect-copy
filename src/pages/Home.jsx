import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/feed/PostCard';
import CreatePost from '@/components/feed/CreatePost';
import TrendingWidget from '@/components/widgets/TrendingWidget';
import SuggestedServices from '@/components/widgets/SuggestedServices';
import { Skeleton } from "@/components/ui/skeleton";

export default function Home({ user }) {
  const queryClient = useQueryClient();
  const [userLikes, setUserLikes] = useState([]);

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user's likes
  const loadUserLikes = useCallback(async () => {
    if (!user?.email) return;
    try {
      const likes = await base44.entities.Like.filter({ user_email: user.email });
      setUserLikes(likes.map(l => l.post_id));
    } catch (e) {
      console.error('Failed to load likes:', e);
    }
  }, [user?.email]);

  useEffect(() => {
    loadUserLikes();
  }, [loadUserLikes]);

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const handleLikeUpdate = () => {
    loadUserLikes();
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Feed */}
      <div className="flex-1 max-w-[600px] border-r border-gray-100">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Home</h1>
          </div>
        </header>

        {/* Create Post */}
        {user && (
          <CreatePost user={user} onPostCreated={handlePostCreated} />
        )}

        {/* Posts Feed */}
        <div>
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
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <span className="text-6xl mb-4">🐾</span>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Pawbook!</h2>
              <p className="text-gray-500 max-w-sm">
                This is your home feed. Start by creating a post about your pet or explore to find other pet lovers!
              </p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserEmail={user?.email}
                userLikes={userLikes}
                onLikeUpdate={handleLikeUpdate}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar - Desktop Only */}
      <div className="hidden lg:block w-[350px] p-4 space-y-4">
        <TrendingWidget />
        <SuggestedServices />
      </div>
    </div>
  );
}