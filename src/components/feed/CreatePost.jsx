import React, { useState, useRef } from 'react';
import { Image, MapPin, X, AlertTriangle, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

const POST_TYPES = [
  { value: 'general', label: 'General Post', icon: '📝' },
  { value: 'adoption', label: 'Pet for Adoption', icon: '🏠' },
  { value: 'lost', label: 'Lost Pet', icon: '🔍' },
  { value: 'found', label: 'Found Pet', icon: '✨' },
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
  const [isExpanded, setIsExpanded] = useState(false);
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
      setIsExpanded(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-4">
      <div className="flex gap-3">
        <Avatar className="h-11 w-11 ring-2 ring-gray-100">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-medium">
            {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's happening with your pet?"
            className={cn(
              "border-0 resize-none text-[15px] placeholder:text-gray-400 focus-visible:ring-0 p-0 min-h-[60px]",
              isExpanded && "min-h-[100px]"
            )}
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

          {/* Expanded Options */}
          {isExpanded && (
            <div className="mt-4 space-y-3">
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {showLocationField && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                    className="rounded-xl"
                  />
                </div>
              )}

              {showContactField && (
                <Input
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Contact info (phone or email)"
                  className="rounded-xl"
                />
              )}

              {showUrgentToggle && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="urgent"
                    checked={isUrgent}
                    onCheckedChange={setIsUrgent}
                  />
                  <Label htmlFor="urgent" className="flex items-center gap-1 text-sm text-gray-600">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Mark as urgent
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-orange-500 hover:bg-orange-50 rounded-full"
              >
                <Image className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-orange-500 hover:bg-orange-50 rounded-full"
              >
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="rounded-full bg-orange-500 hover:bg-orange-600 px-5"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}