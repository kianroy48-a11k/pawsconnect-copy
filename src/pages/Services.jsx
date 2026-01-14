import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, MapPin, Star, Phone, Globe, Clock, Filter, X, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SERVICE_TYPES = [
  { value: 'all', label: 'All Services', icon: '📍' },
  { value: 'vet', label: 'Veterinarians', icon: '🏥' },
  { value: 'pet_sitter', label: 'Pet Sitters', icon: '🏠' },
  { value: 'groomer', label: 'Groomers', icon: '✂️' },
  { value: 'trainer', label: 'Trainers', icon: '🎓' },
  { value: 'boarding', label: 'Boarding', icon: '🛏️' },
  { value: 'walker', label: 'Dog Walkers', icon: '🚶' },
  { value: 'store', label: 'Pet Stores', icon: '🛒' }
];

export default function Services({ user }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [userLocation, setUserLocation] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', selectedType],
    queryFn: async () => {
      if (selectedType === 'all') {
        return base44.entities.Service.list('-rating', 50);
      }
      return base44.entities.Service.filter({ type: selectedType }, '-rating', 50);
    }
  });

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // For now, just a placeholder - in real app would convert coords to city
        setUserLocation('Current Location');
      }, () => {
        setUserLocation('');
      });
    }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!userLocation) return matchesSearch;
    
    return matchesSearch && s.city?.toLowerCase().includes(userLocation.toLowerCase());
  });

  const getServiceIcon = (type) => {
    return SERVICE_TYPES.find(t => t.value === type)?.icon || '📍';
  };

  return (
    <div className="max-w-[900px] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Find Services</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or city..."
              className="pl-10 rounded-full bg-gray-100 border-0 focus-visible:ring-orange-500"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {SERVICE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition",
                selectedType === type.value
                  ? "bg-orange-300 text-gray-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <span>{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Services Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🔍</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No services found</h2>
            <p className="text-gray-500">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <Sheet key={service.id}>
                <SheetTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-all overflow-hidden">
                    <CardContent className="p-0">
                      {service.image_url ? (
                        <img 
                          src={service.image_url} 
                          alt={service.name}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                          <span className="text-5xl">{getServiceIcon(service.type)}</span>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">{service.city}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                            <span className="font-medium text-sm">{service.rating?.toFixed(1) || 'New'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs capitalize">
                            {service.type?.replace('_', ' ')}
                          </Badge>
                          {service.accepts_emergency && (
                            <Badge className="bg-red-100 text-red-700 text-xs">24/7 Emergency</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-left">{service.name}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {service.image_url ? (
                      <img 
                        src={service.image_url} 
                        alt={service.name}
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center">
                        <span className="text-6xl">{getServiceIcon(service.type)}</span>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-amber-400 fill-current" />
                        <span className="font-semibold text-lg">{service.rating?.toFixed(1) || 'New'}</span>
                      </div>
                      <span className="text-gray-500">({service.reviews_count || 0} reviews)</span>
                    </div>

                    {/* Description */}
                    {service.description && (
                      <p className="text-gray-600">{service.description}</p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-3">
                      {service.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <span className="text-gray-700">{service.address}, {service.city}</span>
                        </div>
                      )}
                      {service.phone && (
                        <a href={`tel:${service.phone}`} className="flex items-center gap-3 text-orange-500 hover:text-orange-600">
                          <Phone className="w-5 h-5" />
                          <span>{service.phone}</span>
                        </a>
                      )}
                      {service.website && (
                        <a href={service.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-orange-500 hover:text-orange-600">
                          <Globe className="w-5 h-5" />
                          <span>Visit Website</span>
                        </a>
                      )}
                      {service.hours && (
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                          <span className="text-gray-700">{service.hours}</span>
                        </div>
                      )}
                    </div>

                    {/* Services Offered */}
                    {service.services_offered?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Services Offered</h4>
                        <div className="flex flex-wrap gap-2">
                          {service.services_offered.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-sm">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      {service.phone && (
                        <Button asChild className="flex-1 bg-gradient-to-r from-orange-300 to-pink-300 hover:from-orange-400 hover:to-pink-400 text-gray-800 rounded-full">
                          <a href={`tel:${service.phone}`}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call Now
                          </a>
                        </Button>
                      )}
                      {service.website && (
                        <Button asChild variant="outline" className="flex-1 rounded-full">
                          <a href={service.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}