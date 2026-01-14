import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PostCard from '@/components/feed/PostCard';

const SPECIES_FILTERS = [
  { value: 'all', label: 'All Pets', icon: '🐾' },
  { value: 'dog', label: 'Dogs', icon: '🐕' },
  { value: 'cat', label: 'Cats', icon: '🐱' },
  { value: 'bird', label: 'Birds', icon: '🐦' },
  { value: 'rabbit', label: 'Rabbits', icon: '🐰' },
  { value: 'other', label: 'Other', icon: '🦔' }
];

export default function Adoption({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [userLikes, setUserLikes] = useState([]);

  // Fetch adoption posts
  const { data: adoptionPosts = [], isLoading } = useQuery({
    queryKey: ['adoption-posts'],
    queryFn: () => base44.entities.Post.filter({ post_type: 'adoption' }, '-created_date', 50)
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

  const [petMap, setPetMap] = React.useState({});

  React.useEffect(() => {
    const loadPets = async () => {
      if (!adoptionPosts.length) return;
      const petIds = [...new Set(adoptionPosts.map(p => p.pet_id).filter(Boolean))];
      if (petIds.length === 0) return;
      try {
        const petsData = await Promise.all(petIds.map(id => base44.entities.Pet.filter({ id })));
        const map = {};
        petsData.forEach((petArray) => {
          if (petArray.length > 0) {
            map[petArray[0].id] = petArray[0];
          }
        });
        setPetMap(map);
      } catch (e) {
        console.error(e);
      }
    };
    loadPets();
  }, [adoptionPosts]);

  const filteredPosts = adoptionPosts.filter(p => {
    const matchesSearch = p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (speciesFilter === 'all') return matchesSearch;
    
    const pet = p.pet_id ? petMap[p.pet_id] : null;
    const matchesSpecies = pet?.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="max-w-[900px] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Adopt a Pet</h1>
              <p className="text-sm text-gray-500">Give a pet a loving forever home</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location..."
              className="pl-10 rounded-full bg-gray-100 border-0 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {/* Species Filter */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {SPECIES_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSpeciesFilter(filter.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition",
                speciesFilter === filter.value
                  ? "bg-blue-400 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <span>{filter.icon}</span>
              <span className="text-sm font-medium">{filter.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Adoption Posts */}
      <div>
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Adoption Posts</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🏠</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No adoption posts yet</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Be the first to post a pet for adoption or check back later!
            </p>
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