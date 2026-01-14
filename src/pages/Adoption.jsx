import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, Search, Filter, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import moment from 'moment';
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

  // Fetch pets available for adoption
  const { data: adoptablePets = [], isLoading: loadingPets } = useQuery({
    queryKey: ['adoptable-pets', speciesFilter],
    queryFn: async () => {
      if (speciesFilter === 'all') {
        return base44.entities.Pet.filter({ is_available_for_adoption: true }, '-created_date', 50);
      }
      return base44.entities.Pet.filter({ is_available_for_adoption: true, species: speciesFilter }, '-created_date', 50);
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

  const filteredPosts = adoptionPosts.filter(p =>
    p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[900px] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Adopt a Pet</h1>
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
              className="pl-10 rounded-full bg-gray-100 border-0 focus-visible:ring-orange-500"
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
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <span>{filter.icon}</span>
              <span className="text-sm font-medium">{filter.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Featured Pets for Adoption */}
      {adoptablePets.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Featured Pets</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {adoptablePets.slice(0, 10).map((pet) => (
              <Sheet key={pet.id}>
                <SheetTrigger asChild>
                  <div className="flex-shrink-0 w-32 cursor-pointer">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-2">
                      {pet.avatar_url ? (
                        <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <span className="text-4xl">
                          {pet.species === 'dog' ? '🐕' : 
                           pet.species === 'cat' ? '🐱' : 
                           pet.species === 'bird' ? '🐦' : 
                           pet.species === 'rabbit' ? '🐰' : '🐾'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 truncate">{pet.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{pet.breed || pet.species}</p>
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{pet.name}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="w-full h-64 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                      {pet.avatar_url ? (
                        <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <span className="text-8xl">
                          {pet.species === 'dog' ? '🐕' : 
                           pet.species === 'cat' ? '🐱' : 
                           pet.species === 'bird' ? '🐦' : 
                           pet.species === 'rabbit' ? '🐰' : '🐾'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                      <p className="text-gray-500 capitalize">{pet.breed || pet.species}</p>
                    </div>
                    {pet.age_years && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{pet.age_years} years {pet.age_months ? `${pet.age_months} months` : ''} old</span>
                      </div>
                    )}
                    {pet.bio && (
                      <p className="text-gray-600">{pet.bio}</p>
                    )}
                    {pet.personality_tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pet.personality_tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="capitalize">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <Button className="w-full bg-pink-500 hover:bg-pink-600 rounded-full">
                      <Heart className="w-4 h-4 mr-2" />
                      Inquire About Adoption
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </div>
      )}

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
            />
          ))
        )}
      </div>
    </div>
  );
}