import React, { useState, useRef } from 'react';
import { Image, MapPin, X, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const POST_TYPES = [
  { value: 'general', label: 'General Post', icon: '📝' },
  { value: 'question', label: 'Ask a Question', icon: '❓' },
  { value: 'adoption', label: 'Pet for Adoption', icon: '🏠' },
  { value: 'lost', label: 'Lost Pet', icon: '🚨' },
  { value: 'found', label: 'Found Pet', icon: '🔔' },
  { value: 'challenge', label: 'Challenge Entry', icon: '🏆' },
  { value: 'service_review', label: 'Service Review', icon: '⭐' }
];

export default function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef(null);

  const showLocationField = ['lost', 'found', 'adoption'].includes(postType);
  const showContactField = ['lost', 'adoption'].includes(postType);
  const showUrgentToggle = ['lost', 'found'].includes(postType);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEnhanceWithAI = async () => {
    if (!content.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a social media expert for a pet community app. Improve the following post to make it more engaging, friendly, and appealing while keeping the same meaning and intent. Add relevant emojis and make it warm and community-friendly. Keep it concise (under 280 characters if possible). Only return the improved text, nothing else.

Original post: "${content}"`,
      });
      setContent(response);
    } catch (error) {
      console.error('Failed to enhance:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = file_url;
      }

      const tags = content.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];

      await base44.entities.Post.create({
        content: content.trim(),
        post_type: postType,
        image_url: imageUrl,
        author_name: user?.full_name || 'Anonymous',
        author_avatar: user?.avatar_url,
        location: location || null,
        contact_info: contactInfo || null,
        is_urgent: isUrgent,
        tags,
        likes_count: 0,
        comments_count: 0
      });

      // Reset form
      setContent('');
      setPostType('general');
      setLocation('');
      setContactInfo('');
      setIsUrgent(false);
      removeImage();
      onPostCreated?.();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-border">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-200 to-sky-200 text-gray-700 font-medium">
              {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder=""
            className="border-0 resize-none text-[15px] placeholder:text-muted-foreground focus-visible:ring-0 p-0 min-h-[60px] bg-transparent"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-64 rounded-2xl" />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black/80 transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                aria-label="Upload image"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:bg-blue-50 rounded-full"
                    aria-label="Add image"
                  >
                    <Image className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add image</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleEnhanceWithAI}
                    disabled={!content.trim() || isEnhancing}
                    className="text-purple-400 hover:bg-purple-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Enhance with AI"
                  >
                    {isEnhancing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enhance with AI</TooltipContent>
              </Tooltip>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="rounded-full bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}