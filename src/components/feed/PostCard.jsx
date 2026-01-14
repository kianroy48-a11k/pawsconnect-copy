import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin, AlertTriangle, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import moment from 'moment';
import CommentSection from './CommentSection';

const POST_TYPE_CONFIG = {
  general: { label: null, color: null },
  adoption: { label: 'Adoption', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  lost: { label: 'Lost Pet', color: 'bg-red-100 text-red-700 border-red-200' },
  found: { label: 'Found Pet', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  challenge: { label: 'Challenge', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  service_review: { label: 'Review', color: 'bg-amber-100 text-amber-700 border-amber-200' }
};

export default function PostCard({ post, currentUserEmail, onLikeUpdate, userLikes = [] }) {
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count || 0);
  
  const isLiked = userLikes.includes(post.id);
  const typeConfig = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.general;

  const handleLike = async () => {
    if (!currentUserEmail || isLiking) return;
    setIsLiking(true);
    
    try {
      if (isLiked) {
        const likes = await base44.entities.Like.filter({ post_id: post.id, user_email: currentUserEmail });
        if (likes.length > 0) {
          await base44.entities.Like.delete(likes[0].id);
          setLocalLikesCount(prev => Math.max(0, prev - 1));
          await base44.entities.Post.update(post.id, { likes_count: Math.max(0, localLikesCount - 1) });
        }
      } else {
        await base44.entities.Like.create({ post_id: post.id, user_email: currentUserEmail });
        setLocalLikesCount(prev => prev + 1);
        await base44.entities.Post.update(post.id, { likes_count: localLikesCount + 1 });
      }
      onLikeUpdate?.();
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author_name}`,
          text: post.content,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled
      }
    }
  };

  return (
    <article className="bg-white border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-gray-100">
            <AvatarImage src={post.author_avatar} alt={post.author_name} />
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-medium">
              {post.author_name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-[15px]">{post.author_name}</span>
              <span className="text-gray-400 text-sm">·</span>
              <span className="text-gray-500 text-sm">{moment(post.created_date).fromNow()}</span>
              {typeConfig.label && (
                <Badge variant="outline" className={cn("text-xs font-medium", typeConfig.color)}>
                  {post.is_urgent && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {typeConfig.label}
                </Badge>
              )}
            </div>
            
            {/* Content */}
            <p className="mt-2 text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            
            {/* Location */}
            {post.location && (
              <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{post.location}</span>
              </div>
            )}
            
            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-orange-500 text-sm hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Image */}
            {post.image_url && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100">
                <img 
                  src={post.image_url} 
                  alt="Post content" 
                  className="w-full max-h-[500px] object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Contact Info for special posts */}
            {post.contact_info && (post.post_type === 'adoption' || post.post_type === 'lost') && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm">
                <span className="text-gray-500">Contact: </span>
                <span className="text-gray-800 font-medium">{post.contact_info}</span>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-3 pt-2 -ml-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full px-3 gap-2"
              >
                <MessageCircle className="w-[18px] h-[18px]" />
                <span className="text-sm">{localCommentsCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLike}
                disabled={isLiking || !currentUserEmail}
                className={cn(
                  "rounded-full px-3 gap-2",
                  isLiked 
                    ? "text-red-500 hover:text-red-600 hover:bg-red-50" 
                    : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                )}
              >
                <Heart className={cn("w-[18px] h-[18px]", isLiked && "fill-current")} />
                <span className="text-sm">{localLikesCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
                className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full px-3"
              >
                <Share2 className="w-[18px] h-[18px]" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full px-3"
              >
                <Bookmark className="w-[18px] h-[18px]" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <CommentSection 
            postId={post.id} 
            currentUserEmail={currentUserEmail}
            onCommentAdded={() => setLocalCommentsCount(prev => prev + 1)}
          />
        )}
      </div>
    </article>
  );
}