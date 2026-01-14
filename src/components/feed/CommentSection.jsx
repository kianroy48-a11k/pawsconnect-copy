import React, { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from '@/api/base44Client';
import moment from 'moment';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CommentSection({ postId, currentUserEmail, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadComments();
    loadCurrentUser();
  }, [postId]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (e) {
      // Not logged in
    }
  };

  const loadComments = async () => {
    try {
      const data = await base44.entities.Comment.filter({ post_id: postId }, '-created_date', 50);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserEmail || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const comment = await base44.entities.Comment.create({
        post_id: postId,
        content: newComment.trim(),
        author_name: currentUser?.full_name || 'Anonymous',
        author_avatar: currentUser?.avatar_url,
        author_email: currentUserEmail
      });
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      // Update comment count on the post
      const postData = await base44.entities.Post.filter({ id: postId });
      if (postData.length > 0) {
        await base44.entities.Post.update(postId, { 
          comments_count: (postData[0].comments_count || 0) + 1 
        });
      }
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="mt-4 pt-4 border-t border-gray-100 ml-14">
        {/* Comment Input */}
        {currentUserEmail && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-orange-200 to-pink-200 text-gray-700 text-xs">
                {currentUser?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-full bg-gray-100 border-0 focus-visible:ring-orange-400"
              disabled={isSubmitting}
              aria-label="Write a comment"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!newComment.trim() || isSubmitting}
                  className="rounded-full bg-gradient-to-r from-orange-300 to-pink-300 hover:from-orange-400 hover:to-pink-400 h-9 w-9 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send comment"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send comment</TooltipContent>
            </Tooltip>
          </form>
        )}

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-gray-400 text-sm">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">No comments yet. Be the first!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author_avatar} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  {comment.author_name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-3 py-2">
                  <span className="font-medium text-sm text-gray-900">{comment.author_name}</span>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
                <span className="text-xs text-gray-400 ml-3">{moment(comment.created_date).fromNow()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}