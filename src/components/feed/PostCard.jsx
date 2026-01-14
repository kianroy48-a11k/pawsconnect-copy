import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MapPin, AlertTriangle, Bookmark, MoreHorizontal, Trash2, BookmarkCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import moment from 'moment';
import CommentSection from './CommentSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const POST_TYPE_CONFIG = {
  general: { label: null, color: null },
  question: { label: 'Question', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  adoption: { label: 'Adoption', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  lost: { label: 'Lost Pet', color: 'bg-red-50 text-red-600 border-red-100' },
  found: { label: 'Found Pet', color: 'bg-sky-50 text-sky-600 border-sky-100' },
  challenge: { label: 'Challenge', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  service_review: { label: 'Review', color: 'bg-amber-50 text-amber-600 border-amber-100' }
};

export default function PostCard({ post, currentUserEmail, onLikeUpdate, userLikes = [], onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count || 0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const isLiked = userLikes.includes(post.id);
  const isOwnPost = post.created_by === currentUserEmail;
  const typeConfig = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.general;

  // Check if post is saved
  useEffect(() => {
    const checkSaved = async () => {
      if (!currentUserEmail) return;
      try {
        const saved = await base44.entities.SavedPost.filter({ 
          post_id: post.id, 
          user_email: currentUserEmail 
        });
        setIsSaved(saved.length > 0);
      } catch (e) {
        console.error(e);
      }
    };
    checkSaved();
  }, [post.id, currentUserEmail]);

  const handleSave = async () => {
    if (!currentUserEmail || isSaving) return;
    setIsSaving(true);
    
    try {
      if (isSaved) {
        const saved = await base44.entities.SavedPost.filter({ 
          post_id: post.id, 
          user_email: currentUserEmail 
        });
        if (saved.length > 0) {
          await base44.entities.SavedPost.delete(saved[0].id);
        }
        setIsSaved(false);
      } else {
        await base44.entities.SavedPost.create({ 
          post_id: post.id, 
          user_email: currentUserEmail 
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await base44.entities.Post.delete(post.id);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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
    <TooltipProvider>
      <article className="bg-white border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
        <div className="px-4 py-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-gray-100">
              <AvatarImage src={post.author_avatar} alt={post.author_name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-200 to-pink-200 text-gray-700 font-medium">
                {post.author_name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
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
              
              {isOwnPost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600" aria-label="More options">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowComments(!showComments)}
                    className="text-gray-500 hover:text-orange-400 hover:bg-orange-50 rounded-full px-3 gap-2"
                    aria-label="Comments"
                  >
                    <MessageCircle className="w-[18px] h-[18px]" />
                    <span className="text-sm">{localCommentsCount}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Comments</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLike}
                    disabled={isLiking || !currentUserEmail}
                    className={cn(
                      "rounded-full px-3 gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                      isLiked 
                        ? "text-red-400 hover:text-red-500 hover:bg-red-50" 
                        : "text-gray-500 hover:text-red-400 hover:bg-red-50"
                    )}
                    aria-label={isLiked ? "Unlike" : "Like"}
                  >
                    <Heart className={cn("w-[18px] h-[18px]", isLiked && "fill-current")} />
                    <span className="text-sm">{localLikesCount}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isLiked ? "Unlike" : "Like"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleShare}
                    className="text-gray-500 hover:text-sky-400 hover:bg-sky-50 rounded-full px-3"
                    aria-label="Share"
                  >
                    <Share2 className="w-[18px] h-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !currentUserEmail}
                    className={cn(
                      "rounded-full px-3 disabled:opacity-50 disabled:cursor-not-allowed",
                      isSaved 
                        ? "text-orange-400 hover:text-orange-500 hover:bg-orange-50" 
                        : "text-gray-500 hover:text-orange-400 hover:bg-orange-50"
                    )}
                    aria-label={isSaved ? "Unsave" : "Save"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-[18px] h-[18px] fill-current" />
                    ) : (
                      <Bookmark className="w-[18px] h-[18px]" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isSaved ? "Unsave" : "Save"}</TooltipContent>
              </Tooltip>
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
    </TooltipProvider>
  );
}