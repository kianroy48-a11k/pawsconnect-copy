import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, Plus, Camera, MapPin, Calendar, Link as LinkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PostCard from '@/components/feed/PostCard';
import moment from 'moment';

const SPECIES_OPTIONS = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐱 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'fish', label: '🐠 Fish' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'hamster', label: '🐹 Hamster' },
  { value: 'reptile', label: '🦎 Reptile' },
  { value: 'other', label: '🐾 Other' }
];

export default function Profile({ user }) {
  const queryClient = useQueryClient();
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', species: 'dog', breed: '', bio: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLikes, setUserLikes] = useState([]);

  // Fetch user's pets
  const { data: pets = [], isLoading: loadingPets } = useQuery({
    queryKey: ['user-pets', user?.email],
    queryFn: () => base44.entities.Pet.filter({ owner_email: user?.email }),
    enabled: !!user?.email
  });

  // Fetch user's posts
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['user-posts', user?.email],
    queryFn: () => base44.entities.Post.filter({ created_by: user?.email }, '-created_date'),
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

  const handleAddPet = async () => {
    if (!newPet.name.trim()) return;
    setIsSubmitting(true);
    
    try {
      await base44.entities.Pet.create({
        ...newPet,
        owner_id: user?.id,
        owner_email: user?.email
      });
      queryClient.invalidateQueries({ queryKey: ['user-pets'] });
      setShowAddPet(false);
      setNewPet({ name: '', species: 'dog', breed: '', bio: '' });
    } catch (error) {
      console.error('Failed to add pet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] border-r border-gray-100 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Profile Banner */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-500" />
        <div className="absolute -bottom-12 left-4">
          <Avatar className="h-24 w-24 border-4 border-white ring-2 ring-orange-100">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white text-2xl font-bold">
              {user.full_name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pt-16 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <Button variant="outline" className="rounded-full">
            Edit Profile
          </Button>
        </div>
        
        {user.bio && (
          <p className="mt-3 text-gray-700">{user.bio}</p>
        )}
        
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Joined {moment(user.created_date).format('MMMM YYYY')}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div>
            <span className="font-bold text-gray-900">{posts.length}</span>
            <span className="text-gray-500 ml-1">Posts</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">{pets.length}</span>
            <span className="text-gray-500 ml-1">Pets</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-transparent border-b border-gray-100 rounded-none h-auto p-0">
          <TabsTrigger 
            value="posts" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent py-3"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="pets" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent py-3"
          >
            My Pets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {loadingPosts ? (
            <div className="p-8 text-center text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-2 block">📝</span>
              <p className="text-gray-500">No posts yet. Share your first pet moment!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserEmail={user.email}
                userLikes={userLikes}
                onLikeUpdate={loadUserLikes}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pets" className="mt-0 p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Add Pet Card */}
            <Dialog open={showAddPet} onOpenChange={setShowAddPet}>
              <DialogTrigger asChild>
                <button className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-orange-300 hover:bg-orange-50/50 transition">
                  <Plus className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Add Pet</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add a New Pet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Pet Name</Label>
                    <Input
                      value={newPet.name}
                      onChange={(e) => setNewPet(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="What's your pet's name?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Species</Label>
                    <Select 
                      value={newPet.species} 
                      onValueChange={(value) => setNewPet(prev => ({ ...prev, species: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIES_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Breed (optional)</Label>
                    <Input
                      value={newPet.breed}
                      onChange={(e) => setNewPet(prev => ({ ...prev, breed: e.target.value }))}
                      placeholder="e.g., Golden Retriever"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bio (optional)</Label>
                    <Textarea
                      value={newPet.bio}
                      onChange={(e) => setNewPet(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about your pet..."
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleAddPet} 
                    disabled={!newPet.name.trim() || isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Pet'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Pet Cards */}
            {pets.map(pet => (
              <div 
                key={pet.id} 
                className="aspect-square rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 p-4 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl">
                  {pet.species === 'dog' ? '🐕' : 
                   pet.species === 'cat' ? '🐱' : 
                   pet.species === 'bird' ? '🐦' : 
                   pet.species === 'fish' ? '🐠' : 
                   pet.species === 'rabbit' ? '🐰' : 
                   pet.species === 'hamster' ? '🐹' : 
                   pet.species === 'reptile' ? '🦎' : '🐾'}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{pet.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{pet.breed || pet.species}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}