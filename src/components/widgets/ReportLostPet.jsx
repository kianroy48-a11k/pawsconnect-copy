import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportLostPet() {
  return (
    <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Lost Your Pet?</h3>
          <p className="text-sm text-gray-600 mb-3">Report a lost pet and get help from the community</p>
          <Button 
            asChild 
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <Link to={createPageUrl('CreatePost?type=lost')}>
              Report Lost Pet
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}