import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Search, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import moment from 'moment';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Messages({ user }) {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const allConvos = await base44.entities.Conversation.list('-last_message_at');
      return allConvos.filter(c => c.participants?.includes(user?.email));
    },
    enabled: !!user?.email,
    refetchInterval: 5000
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => base44.entities.Message.filter(
      { conversation_id: selectedConversation.id },
      'created_date'
    ),
    enabled: !!selectedConversation?.id,
    refetchInterval: 3000
  });

  // Fetch all users for new chat
  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: showNewChat
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!selectedConversation?.id) return;
    
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === selectedConversation.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
      }
    });
    
    return () => unsubscribe();
  }, [selectedConversation?.id, queryClient]);

  const getOtherParticipant = (conversation) => {
    const otherEmail = conversation.participants?.find(p => p !== user?.email);
    return otherEmail || 'Unknown';
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      await base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        sender_name: user.full_name,
        content: newMessage.trim()
      });

      await base44.entities.Conversation.update(selectedConversation.id, {
        last_message: newMessage.trim().substring(0, 50),
        last_message_at: new Date().toISOString()
      });

      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatEmail.trim()) return;

    // Check if conversation already exists
    const existing = conversations.find(c => 
      c.participants?.includes(newChatEmail.toLowerCase())
    );

    if (existing) {
      setSelectedConversation(existing);
      setShowNewChat(false);
      setNewChatEmail('');
      return;
    }

    try {
      const newConvo = await base44.entities.Conversation.create({
        participants: [user.email, newChatEmail.toLowerCase()],
        last_message: '',
        last_message_at: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(newConvo);
      setShowNewChat(false);
      setNewChatEmail('');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.email !== user?.email && 
    (u.email?.toLowerCase().includes(newChatEmail.toLowerCase()) ||
     u.full_name?.toLowerCase().includes(newChatEmail.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-[900px] border-r border-gray-100 min-h-screen flex">
        {/* Conversations List */}
        <div className={cn(
          "w-full md:w-[320px] border-r border-gray-100 flex flex-col",
          selectedConversation && "hidden md:flex"
        )}>
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => setShowNewChat(true)}
                    aria-label="New message"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New message</TooltipContent>
              </Tooltip>
            </div>
            
            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages"
                  className="pl-10 rounded-full bg-gray-50 border-0"
                  aria-label="Search messages"
                />
              </div>
            </div>
          </header>

          {/* New Chat Input */}
          {showNewChat && (
            <div className="p-4 border-b border-gray-100 bg-orange-50/50">
              <p className="text-sm font-medium text-gray-700 mb-2">Start a new conversation</p>
              <Input
                value={newChatEmail}
                onChange={(e) => setNewChatEmail(e.target.value)}
                placeholder="Enter email or search users..."
                className="mb-2 rounded-xl"
                aria-label="Search for users"
              />
              {newChatEmail && filteredUsers.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredUsers.slice(0, 5).map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setNewChatEmail(u.email);
                        handleStartNewChat();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white transition text-left"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-orange-200 to-pink-200 text-gray-700 text-xs">
                          {u.full_name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setShowNewChat(false); setNewChatEmail(''); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleStartNewChat}
                  disabled={!newChatEmail.trim()}
                  className="flex-1 bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Chat
                </Button>
              </div>
            </div>
          )}

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">Start a new chat to connect with other pet lovers</p>
              </div>
            ) : (
              conversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-50",
                    selectedConversation?.id === convo.id && "bg-orange-50/50"
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-orange-200 to-pink-200 text-gray-700">
                      {getOtherParticipant(convo).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-gray-900 truncate text-sm">
                      {getOtherParticipant(convo)}
                    </p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">
                      {convo.last_message || 'No messages yet'}
                    </p>
                  </div>
                  {convo.last_message_at && (
                    <span className="text-xs text-gray-400">
                      {moment(convo.last_message_at).fromNow(true)}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className={cn(
          "flex-1 flex flex-col",
          !selectedConversation && "hidden md:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden rounded-full"
                      onClick={() => setSelectedConversation(null)}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Back</TooltipContent>
                </Tooltip>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-orange-200 to-pink-200 text-gray-700">
                    {getOtherParticipant(selectedConversation).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {getOtherParticipant(selectedConversation)}
                  </p>
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender_email === user.email ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5",
                          msg.sender_email === user.email
                            ? "bg-gradient-to-r from-orange-200 to-pink-200 text-gray-800"
                            : "bg-white border border-gray-100 text-gray-800"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {moment(msg.created_date).format('h:mm A')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1 rounded-full bg-gray-50 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Type a message"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="rounded-full bg-gradient-to-r from-orange-300 to-pink-300 hover:from-orange-400 hover:to-pink-400 h-10 w-10 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Send className="w-4 h-4 text-white" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50/30">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">Select a conversation</p>
                <p className="text-gray-400 text-sm mt-1">Choose a chat or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}