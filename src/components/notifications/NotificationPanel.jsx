import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import moment from 'moment';

const NOTIFICATION_ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  challenge: Trophy,
};

// Mock notifications for now
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'like',
    user: 'Sarah Johnson',
    avatar: null,
    message: 'liked your post',
    time: new Date(Date.now() - 1000 * 60 * 5),
    read: false
  },
  {
    id: 2,
    type: 'comment',
    user: 'Mike Chen',
    avatar: null,
    message: 'commented on your post',
    time: new Date(Date.now() - 1000 * 60 * 30),
    read: false
  },
  {
    id: 3,
    type: 'follow',
    user: 'Emma Wilson',
    avatar: null,
    message: 'started following you',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true
  },
  {
    id: 4,
    type: 'challenge',
    user: 'Pawbook',
    avatar: null,
    message: 'New challenge: Trick Master Challenge',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true
  }
];

export default function NotificationPanel() {
  const notifications = MOCK_NOTIFICATIONS;

  return (
    <div className="w-96 max-h-[500px] flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Notifications</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = NOTIFICATION_ICONS[notif.type] || Bell;
              
              return (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-muted transition cursor-pointer ${
                    !notif.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={notif.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-200 to-sky-200 text-gray-700">
                        {notif.user?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{notif.user}</span>{' '}
                            <span className="text-muted-foreground">{notif.message}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {moment(notif.time).fromNow()}
                          </p>
                        </div>
                        
                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </div>
                  
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 ml-auto mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}