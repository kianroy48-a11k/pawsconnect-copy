import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/feed/PostCard';
import TrendingWidget from '@/components/widgets/TrendingWidget';
import SuggestedServices from '@/components/widgets/SuggestedServices';
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Moon, Sun, Bell, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationPanel from '@/components/notifications/NotificationPanel';

export default function Home({ user }) {
  const queryClient = useQueryClient();
  const [userLikes, setUserLikes] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', String(newMode));
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  // Fetch posts
  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Real-time subscription for new posts
  useEffect(() => {
    const unsubscribe = base44.entities.Post.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update' || event.type === 'delete') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

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
    <div className="flex min-h-screen bg-background">
      {/* Main Feed - Center aligned */}
      <div className="w-full max-w-[750px] border-r border-border mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-center gap-3 max-w-[750px] mx-auto">
              <h1 className="text-xl font-bold text-foreground flex-shrink-0">Home</h1>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search PawsConnect..." 
                  className="pl-9 bg-muted border-0 focus-visible:ring-blue-500 h-9"
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                  <NotificationPanel />
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="flex-shrink-0"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Search Suggestions / Posts Feed */}
        <div>
          {showSearchSuggestions ? (
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Trending Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {['#AdoptDontShop', '#PetChallenge', '#LostPet', '#PetCare', '#DogLife', '#CatLovers', '#PetTraining', '#PetHealth', '#RescuePets', '#PawsomeLife'].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-blue-50 rounded-full text-sm text-blue-500 hover:bg-blue-100 cursor-pointer transition">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : isLoading ? (
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
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Pawbook!</h2>
              <p className="text-muted-foreground max-w-sm">
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
                onDelete={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar - Desktop Only - STICKY - Extreme Right */}
      <div className="hidden lg:block w-[350px] flex-shrink-0 ml-auto">
        <div className="sticky top-0 p-4 pr-6 space-y-4 max-h-screen overflow-y-auto">
          <TrendingWidget />
          <SuggestedServices />
        </div>
      </div>
    </div>
  );
}