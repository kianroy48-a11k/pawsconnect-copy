import React from 'react';
import { cn } from "@/lib/utils";

export default function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "rounded-full border-2 border-gray-200 border-t-orange-500 animate-spin",
        sizeClasses[size]
      )} />
    </div>
  );
}