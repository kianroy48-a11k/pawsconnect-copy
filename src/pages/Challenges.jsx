import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Users, Calendar, Flame, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from '@/components/feed/PostCard';
import moment from 'moment';
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = {
  photo: 'from-pink-400 to-rose-500',
  trick: 'from-blue-400 to-indigo-500',
  adventure: 'from-green-400 to-emerald-500',
  wellness: 'from-cyan-400 to-teal-500',
  fashion: 'from-purple-400 to-violet-500',
  friendship: 'from-orange-400 to-amber-500'
};

const CATEGORY_ICONS = {
  photo: '📸',
  trick: '🎪',
  adventure: '🏕️',
  wellness: '💪',
  fashion: '👗',
  friendship: '🤝'
};

export default function Challenges({ user }) {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [userLikes, setUserLikes] = useState([]);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list('-created_date', 20)
  });

  const { data: challengePosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['challenge-posts', selectedChallenge?.id],
    queryFn: () => base44.entities.Post.filter({ challenge_id: selectedChallenge?.id }, '-likes_count', 50),
    enabled: !!selectedChallenge?.id
  });

  const activeChallenges = challenges.filter(c => c.is_active);
  const pastChallenges = challenges.filter(c => !c.is_active);

  const loadUserLikes = async () => {
    if (!user?.email) return;
    try {
      const likes = await base44.entities.Like.filter({ user_email: user.email });
      setUserLikes(likes.map(l => l.post_id));
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    loadUserLikes();
  }, [user?.email]);

  const ChallengeCard = ({ challenge, featured = false }) => (
    <Card 
      className={cn(
        "cursor-pointer overflow-hidden transition-all hover:shadow-lg",
        featured && "col-span-2 md:col-span-1"
      )}
      onClick={() => setSelectedChallenge(challenge)}
    >
      <div className={cn(
        "h-32 bg-gradient-to-br flex items-center justify-center",
        CATEGORY_COLORS[challenge.category] || CATEGORY_COLORS.photo
      )}>
        <span className="text-6xl">{CATEGORY_ICONS[challenge.category] || '🏆'}</span>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
            <p className="text-sm text-orange-500 mt-1">#{challenge.hashtag}</p>
          </div>
          {challenge.is_active && (
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{challenge.description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {challenge.participants_count || 0}
          </span>
          {challenge.end_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {moment(challenge.end_date).format('MMM D')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-[900px] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Challenges</h1>
              <p className="text-sm text-gray-500">Join fun challenges with your pets!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Challenge Detail View */}
      {selectedChallenge ? (
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setSelectedChallenge(null)}
            className="m-4"
          >
            ← Back to challenges
          </Button>
          
          <div className={cn(
            "mx-4 rounded-2xl overflow-hidden",
            "bg-gradient-to-br",
            CATEGORY_COLORS[selectedChallenge.category] || CATEGORY_COLORS.photo
          )}>
            <div className="p-6 text-white">
              <Badge className="bg-white/20 text-white mb-3">
                #{selectedChallenge.hashtag}
              </Badge>
              <h2 className="text-2xl font-bold mb-2">{selectedChallenge.title}</h2>
              <p className="text-white/90">{selectedChallenge.description}</p>
              <div className="flex items-center gap-4 mt-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedChallenge.participants_count || 0} participants
                </span>
                {selectedChallenge.end_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Ends {moment(selectedChallenge.end_date).format('MMMM D, YYYY')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Challenge Posts */}
          <div className="mt-4">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Challenge Entries</h3>
            </div>
            {loadingPosts ? (
              <div className="p-8 text-center text-gray-500">Loading entries...</div>
            ) : challengePosts.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl mb-2 block">🏆</span>
                <p className="text-gray-500">No entries yet. Be the first to participate!</p>
              </div>
            ) : (
              challengePosts.map(post => (
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
      ) : (
        /* Challenges List */
        <div className="p-4">
          <Tabs defaultValue="active">
            <TabsList className="w-full bg-gray-100 p-1 rounded-xl mb-4">
              <TabsTrigger value="active" className="flex-1 rounded-lg">
                <Flame className="w-4 h-4 mr-2" />
                Active
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1 rounded-lg">
                <Trophy className="w-4 h-4 mr-2" />
                Past
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : activeChallenges.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl mb-4 block">🎯</span>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No active challenges</h2>
                  <p className="text-gray-500">Check back soon for new challenges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastChallenges.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl mb-4 block">📜</span>
                  <p className="text-gray-500">No past challenges yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}