import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Conversation, UserRef, ChatItem } from './useChatStore';
import { useChats } from './useChatStore';
import { useEffect, useState } from 'react';

interface SidebarProps {
  conversation?: Conversation;
  counterparty?: UserRef;
  authToken: string;
  onClose?: () => void;
  currentConversationId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversation, 
  counterparty,
  authToken,
  onClose,
  currentConversationId
}) => {
  const navigate = useNavigate();
  const { chats, isLoading, error, fetchChats } = useChats();

  useEffect(() => {
    if (authToken) {
      fetchChats(authToken);
    }
  }, [authToken]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Generate consistent background color based on user ID
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500'
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleChatClick = (chat: ChatItem) => {
    navigate(`/chat/${chat.conversation_id}`);
    if (onClose) {
      onClose();
    }
  };

  console.log('Sidebar chats:', chats);
  console.log('Current conversation ID:', currentConversationId);


  return (
    <div className="w-full bg-card border-r border-border flex flex-col overflow-hidden h-full">
      {/* Mobile header with close button */}
      {onClose && (
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b sm:hidden bg-background">
          <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              setTimeout(() => {
                const conversationsTrigger = document.querySelector('[aria-label="Open conversations"]') as HTMLElement;
                conversationsTrigger?.focus();
              }, 100);
            }}
            className="min-h-[44px] min-w-[44px] rounded-full focus:ring-2 focus:ring-primary/50"
            aria-label="Close conversations"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {!onClose && (
          <div className="p-4 border-b">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversations
            </h3>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 px-4">
            <p className="text-red-500 text-sm mb-2">Failed to load conversations</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchChats(authToken)}
            >
              Retry
            </Button>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {chats.map((chat) => {
              const isActive = currentConversationId === chat.conversation_id;
              const initials = getInitials(chat.counterparty?.name || 'Unknown');
              
              return (
                <button
                  key={chat.conversation_id}
                  onClick={() => handleChatClick(chat)}
                  className={`relative w-full p-4 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/40 shadow-lg ring-2 ring-primary/20 transform scale-[1.02]' 
                      : 'hover:bg-muted/50 border border-transparent hover:border-border/50 hover:shadow-sm'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-11 h-11 flex-shrink-0">
                        {chat.counterparty?.avatar_url ? (
                          <AvatarImage src={chat.counterparty.avatar_url} alt={chat.counterparty?.name || 'Unknown'} />
                        ) : null}
                        <AvatarFallback className={`${getAvatarColor(chat.counterparty?.id || '')} text-white text-sm font-semibold`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Active dot indicator */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="font-semibold text-foreground truncate text-sm">
                            {chat.counterparty?.name || 'Unknown'}
                          </p>
                          {chat.counterparty?.job_title && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5 cursor-help">
                                    {chat.counterparty.job_title}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs">
                                  <p className="text-sm">{chat.counterparty.job_title}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">
                              {formatLastMessageTime(chat.last_message_at)}
                            </span>
                            {/* Unread count badge */}
                            {chat.unread_count && chat.unread_count > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[10px] leading-[16px] text-white bg-red-500">
                                {chat.unread_count > 99 ? '99' : chat.unread_count}
                              </span>
                            )}
                          </div>
                          {chat.status && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 ${
                              chat.status === 'active' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {chat.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {Number(chat.message_count) || 0} message{(Number(chat.message_count) || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;