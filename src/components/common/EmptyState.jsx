import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionPage,
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <span className="text-6xl mb-4">{icon}</span>}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      {description && (
        <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && (
        actionPage ? (
          <Link to={createPageUrl(actionPage)}>
            <Button className="bg-orange-500 hover:bg-orange-600 rounded-full px-6">
              {actionLabel}
            </Button>
          </Link>
        ) : onAction ? (
          <Button 
            onClick={onAction}
            className="bg-orange-500 hover:bg-orange-600 rounded-full px-6"
          >
            {actionLabel}
          </Button>
        ) : null
      )}
    </div>
  );
}