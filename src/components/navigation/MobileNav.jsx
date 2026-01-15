import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search, PlusSquare, MessageSquare, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Create', icon: PlusSquare, page: 'CreatePost' },
  { name: 'Messages', icon: MessageSquare, page: 'Messages' },
  { name: 'Profile', icon: User, page: 'Profile' }
];

export default function MobileNav({ currentPage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                isActive ? "text-blue-500" : "text-gray-400"
              )}
              aria-label={item.name}
            >
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}