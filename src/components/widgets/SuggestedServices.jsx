import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Star, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";

const SERVICE_ICONS = {
  vet: '🏥',
  pet_sitter: '🏠',
  groomer: '✂️',
  trainer: '🎓',
  boarding: '🛏️',
  walker: '🚶',
  store: '🛒'
};

export default function SuggestedServices() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await base44.entities.Service.list('-rating', 3);
      setServices(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-pink-50/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-pink-400" />
        <h3 className="font-semibold text-gray-800">Nearby Services</h3>
      </div>
      
      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No services found</p>
        ) : (
          services.map((service) => (
            <Link
              key={service.id}
              to={createPageUrl(`Services?id=${service.id}`)}
              className="block p-3 bg-white rounded-xl hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{SERVICE_ICONS[service.type] || '📍'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{service.name}</p>
                  <p className="text-xs text-gray-500 truncate">{service.city}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-xs text-gray-600">{service.rating?.toFixed(1) || 'New'}</span>
                    {service.accepts_emergency && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1 text-red-500 border-red-200">
                        24/7
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <Link 
        to={createPageUrl('Services')}
        className="flex items-center justify-center gap-1 mt-4 text-sm text-pink-400 hover:text-pink-500 transition"
      >
        <span>Find services</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}