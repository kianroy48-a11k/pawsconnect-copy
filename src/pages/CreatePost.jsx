import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Image, MapPin, X, AlertTriangle, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

const POST_TYPES = [
  { value: 'general', label: 'General Post', icon: '📝', description: 'Share a moment with your pet' },
  { value: 'adoption', label: 'Pet for Adoption', icon: '🏠', description: 'Help a pet find a home' },
  { value: 'lost', label: 'Lost Pet', icon: '🔍', description: 'Report a missing pet' },
  { value: 'found', label: 'Found Pet', icon: '✨', description: 'Report a found pet' },
  { value: 'challenge', label: 'Challenge Entry', icon: '🏆', description: 'Join a challenge' },
  { value: 'service_review', label: 'Service Review', icon: '⭐', description: 'Review a pet service' }
];

export default function CreatePost({ user }) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[600px] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">New Post</h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="rounded-full bg-orange-500 hover:bg-orange-600 px-6"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Post Type Selection */}
        <div>
          <Label className="text-sm text-gray-500 mb-3 block">What would you like to share?</Label>
          <div className="grid grid-cols-2 gap-2">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setPostType(type.value)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  postType === type.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="font-medium text-sm text-gray-900 mt-1">{type.label}</p>
                <p className="text-xs text-gray-500">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'lost' ? "Describe your lost pet - color, breed, last seen location..."
              : postType === 'found' ? "Describe the pet you found - color, breed, where you found it..."
              : postType === 'adoption' ? "Tell us about this pet - personality, age, special needs..."
              : "What's on your mind? Use #hashtags to join trending topics!"
            }
            className="min-h-[150px] resize-none border-0 text-lg placeholder:text-gray-400 focus-visible:ring-0 p-0"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-h-64 rounded-2xl" />
            <button 
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/70 rounded-full p-2 hover:bg-black/80 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-4 w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Camera className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add a photo</p>
              <p className="text-sm text-gray-500">Share a picture with your post</p>
            </div>
          </button>
        </div>

        {/* Conditional Fields */}
        {showLocationField && (
          <div>
            <Label className="text-sm text-gray-500 mb-2 block">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where was the pet last seen / found?"
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
        )}

        {showContactField && (
          <div>
            <Label className="text-sm text-gray-500 mb-2 block">Contact Information</Label>
            <Input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone number or email"
              className="rounded-xl"
            />
          </div>
        )}

        {showUrgentToggle && (
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-gray-900">Mark as Urgent</p>
                <p className="text-sm text-gray-500">Prioritize this post in search results</p>
              </div>
            </div>
            <Switch
              checked={isUrgent}
              onCheckedChange={setIsUrgent}
            />
          </div>
        )}
      </div>
    </div>
  );
}