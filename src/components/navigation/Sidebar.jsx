import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search, Bell, Bookmark, User, AlertCircle, MapPin, Trophy, Heart, LogOut, PenSquare, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { name: 'Home', icon: Home, page: 'Home', tooltip: 'Home feed' },
  { name: 'Explore', icon: Search, page: 'Explore', tooltip: 'Explore posts' },
  { name: 'Messages', icon: MessageSquare, page: 'Messages', tooltip: 'Your messages' },
  { name: 'Services', icon: MapPin, page: 'Services', tooltip: 'Find pet services' },
  { name: 'Challenges', icon: Trophy, page: 'Challenges', tooltip: 'Pet challenges' },
  { name: 'Adopt', icon: Heart, page: 'Adoption', tooltip: 'Adopt a pet' },
  { name: 'Lost & Found', icon: AlertCircle, page: 'LostFound', tooltip: 'Lost & found pets' },
  { name: 'Saved', icon: Bookmark, page: 'Saved', tooltip: 'Saved posts' },
  { name: 'Profile', icon: User, page: 'Profile', tooltip: 'Your profile' }
];

export default function Sidebar({ currentPage, user }) {
  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <TooltipProvider>
      <nav className="fixed left-0 top-0 h-full w-[68px] xl:w-[260px] flex flex-col border-r border-gray-100 bg-white z-50">
        {/* Logo */}
        <Link 
          to={createPageUrl('Home')}
          className="flex items-center gap-3 px-4 py-6 xl:px-6"
          aria-label="Pawbook Home"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center">
            <span className="text-xl">🐾</span>
          </div>
          <span className="hidden xl:block text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
            Pawbook
          </span>
        </Link>

        {/* Post Button */}
        <div className="px-2 xl:px-4 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={createPageUrl('CreatePost')} className="block" aria-label="Create new post">
                <Button className="w-full bg-gradient-to-r from-orange-300 to-pink-300 hover:from-orange-400 hover:to-pink-400 rounded-full h-12 xl:h-auto">
                  <PenSquare className="w-5 h-5 xl:mr-2" />
                  <span className="hidden xl:inline font-semibold">New Post</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="xl:hidden">Create new post</TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-2 xl:px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            const Icon = item.icon;
            
            return (
              <Tooltip key={item.page}>
                <TooltipTrigger asChild>
                  <Link
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-orange-50 text-orange-500" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                    aria-label={item.tooltip}
                  >
                    <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                    <span className={cn(
                      "hidden xl:block text-[15px]",
                      isActive ? "font-semibold" : "font-medium"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden">{item.tooltip}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* User Section */}
        {user && (
          <div className="p-2 xl:p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-2 xl:p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center text-gray-700 font-semibold">
                {user.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="hidden xl:block flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full mt-2 justify-start text-gray-500 hover:text-red-500 hover:bg-red-50"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="hidden xl:inline">Log out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="xl:hidden">Log out</TooltipContent>
            </Tooltip>
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
}