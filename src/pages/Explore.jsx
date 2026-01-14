import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, TrendingUp, Hash, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PostCard from '@/components/feed/PostCard';

const TRENDING_TAGS = [
  { tag: 'puppylove', count: 2453 },
  { tag: 'catsofpawbook', count: 1892 },
  { tag: 'petadoption', count: 1456 },
  { tag: 'doglife', count: 1234 },
  { tag: 'rescuedog', count: 987 },
  { tag: 'catlover', count: 876 },
  { tag: 'petfriendly', count: 654 },
  { tag: 'dogsofinstagram', count: 543 }
];

export default function Explore({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [userLikes, setUserLikes] = useState([]);

  // Fetch all posts for explore
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['explore-posts', selectedTag],
    queryFn: async () => {
      const allPosts = await base44.entities.Post.list('-likes_count', 100);
      if (selectedTag) {
        return allPosts.filter(p => p.tags?.includes(selectedTag));
      }
      return allPosts;
    }
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

  const filteredPosts = searchQuery
    ? posts.filter(p =>
        p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  return (
    <div className="max-w-[900px] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, users, or #hashtags..."
              className="pl-10 rounded-full bg-gray-100 border-0 focus-visible:ring-orange-500"
            />
          </div>
        </div>

        {/* Selected Tag */}
        {selectedTag && (
          <div className="px-4 pb-3">
            <Badge 
              variant="outline" 
              className="bg-orange-50 text-orange-600 border-orange-200 pr-1"
            >
              <Hash className="w-3 h-3 mr-1" />
              {selectedTag}
              <button 
                onClick={() => setSelectedTag(null)}
                className="ml-2 p-0.5 hover:bg-orange-100 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        )}
      </header>

      {/* Trending Tags */}
      {!searchQuery && !selectedTag && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h2 className="font-semibold text-gray-800">Trending</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((item) => (
              <button
                key={item.tag}
                onClick={() => setSelectedTag(item.tag)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-full text-sm transition"
              >
                <span className="font-medium">#{item.tag}</span>
                <span className="text-gray-400 ml-1 text-xs">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🔍</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h2>
            <p className="text-gray-500">Try a different search term</p>
          </div>
        ) : (
          filteredPosts.map(post => (
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
      </div>
    </div>
  );
}