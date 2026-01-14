import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, MapPin, AlertTriangle, CheckCircle, Filter, PawPrint } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import PostCard from '@/components/feed/PostCard';

export default function LostFound({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('lost');
  const [userLikes, setUserLikes] = useState([]);

  // Fetch lost posts
  const { data: lostPosts = [], isLoading: loadingLost } = useQuery({
    queryKey: ['lost-posts'],
    queryFn: () => base44.entities.Post.filter({ post_type: 'lost' }, '-created_date', 50)
  });

  // Fetch found posts
  const { data: foundPosts = [], isLoading: loadingFound } = useQuery({
    queryKey: ['found-posts'],
    queryFn: () => base44.entities.Post.filter({ post_type: 'found' }, '-created_date', 50)
  });

  const loadUserLikes = async () => {
    if (!user?.email) return;
    try {
      const likes = await base44.entities.Like.filter({ user_email: user.email });
      setUserLikes(likes.map(l => l.post_id));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUserLikes();
  }, [user?.email]);

  const filterPosts = (posts) => {
    if (!searchQuery) return posts;
    return posts.filter(p =>
      p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredLostPosts = filterPosts(lostPosts);
  const filteredFoundPosts = filterPosts(foundPosts);

  const urgentLostCount = lostPosts.filter(p => p.is_urgent).length;

  return (
    <div className="max-w-[900px] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lost & Found</h1>
              <p className="text-sm text-gray-500">Help reunite pets with their families</p>
            </div>
          </div>

          {/* Urgent Alert */}
          {urgentLostCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">
                <strong>{urgentLostCount}</strong> urgent missing pet {urgentLostCount === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location or description..."
              className="pl-10 rounded-full bg-gray-100 border-0 focus-visible:ring-orange-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-transparent border-b border-gray-100 rounded-none h-auto p-0">
              <TabsTrigger 
                value="lost" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:text-red-600 py-3"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Lost ({lostPosts.length})
              </TabsTrigger>
              <TabsTrigger 
                value="found" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent data-[state=active]:text-green-600 py-3"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Found ({foundPosts.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="lost" className="mt-0">
          {loadingLost ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredLostPosts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">🔍</span>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No lost pet reports</h2>
              <p className="text-gray-500">Hopefully all pets are safe at home!</p>
            </div>
          ) : (
            <>
              {/* Urgent Posts First */}
              {filteredLostPosts.filter(p => p.is_urgent).map(post => (
                <div key={post.id} className="border-l-4 border-red-500">
                  <PostCard
                    post={post}
                    currentUserEmail={user?.email}
                    userLikes={userLikes}
                    onLikeUpdate={loadUserLikes}
                    onDelete={() => window.location.reload()}
                  />
                </div>
              ))}
              {/* Non-urgent Posts */}
              {filteredLostPosts.filter(p => !p.is_urgent).map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserEmail={user?.email}
                  userLikes={userLikes}
                  onLikeUpdate={loadUserLikes}
                  onDelete={() => window.location.reload()}
                />
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="found" className="mt-0">
          {loadingFound ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredFoundPosts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">✨</span>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No found pet reports</h2>
              <p className="text-gray-500">Found a pet? Post here to help find its owner!</p>
            </div>
          ) : (
            filteredFoundPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserEmail={user?.email}
                userLikes={userLikes}
                onLikeUpdate={loadUserLikes}
                onDelete={() => window.location.reload()}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}