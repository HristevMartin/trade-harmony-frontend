import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Conversation, UserRef, ChatItem } from './useChatStore';
import { useChats } from './useChatStore';
import { useEffect } from 'react';

interface SidebarProps {
  conversation?: Conversation;
  counterparty?: UserRef;
  authToken: string | null;
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
  
  // Debug logging
  console.log('Sidebar render - chats:', chats.length, 'isLoading:', isLoading, 'error:', error);

  useEffect(() => {
    console.log('Sidebar useEffect triggered, authToken:', !!authToken, 'authToken value:', authToken);
    if (authToken) {
      console.log('Calling fetchChats from Sidebar');
      fetchChats(authToken);
    } else {
      console.log('No authToken, not calling fetchChats');
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
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return minutes < 1 ? 'now' : `${minutes}m`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (diffInHours < 168) { // Within a week
      const days = Math.floor(diffInHours / 24);
      return `${days}d`;
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

  // Skeleton loader component
  const ConversationSkeleton = () => (
    <div className="p-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-muted/30 flex flex-col overflow-hidden h-full border-r border-border">
      {/* Mobile header with close button */}
      {onClose && (
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-700" />
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
            className="min-h-[40px] min-w-[40px] rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Close conversations"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      {/* Desktop header */}
      {!onClose && (
        <div className="p-4 lg:p-6 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg transition-colors duration-200 hover:bg-primary/15">
                <MessageCircle className="w-5 h-5 text-gray-700 transition-colors duration-200" />
              </div>
              Conversations
            </h3>
            {chats.length > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary">
                {chats.length}
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationSkeleton />
        ) : error ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Failed to load conversations</h4>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              There was a problem loading your conversations. Please try again.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => authToken && fetchChats(authToken)}
              disabled={!authToken}
              className="text-sm"
            >
              Try Again
            </Button>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-primary/60" />
            </div>
            <h4 className="font-semibold text-foreground text-lg mb-3">No conversations yet</h4>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              Your conversations will appear here when you start chatting with homeowners about projects.
            </p>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => {
              const isActive = currentConversationId === chat.conversation_id;
              const initials = getInitials(chat.counterparty?.name || 'Unknown');
              const hasUnread = chat.unread_count && chat.unread_count > 0;
              
              return (
                <button
                  key={chat.conversation_id}
                  onClick={() => handleChatClick(chat)}
                  className={`relative w-full p-4 mb-2 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group ${
                    isActive 
                      ? 'bg-primary/8 border border-primary/20 shadow-sm' 
                      : 'hover:bg-muted/50 border border-transparent hover:border-border/30'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full"></div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-12 h-12 ring-2 ring-background shadow-sm">
                        {chat.counterparty?.avatar_url ? (
                          <AvatarImage src={chat.counterparty.avatar_url} alt={chat.counterparty?.name || 'Unknown'} />
                        ) : null}
                        <AvatarFallback className={`${getAvatarColor(chat.counterparty?.id || '')} text-white text-sm font-semibold`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 mr-3">
                          <h4 className={`font-semibold truncate text-sm text-foreground ${hasUnread ? 'font-bold' : ''}`}>
                            {chat.counterparty?.name || 'Unknown'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatLastMessageTime(chat.last_message_at)}
                          </span>
                          {hasUnread && (
                            <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 min-w-[20px] h-5 rounded-full flex items-center justify-center">
                              {chat.unread_count > 99 ? '99+' : chat.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Job title */}
                      {chat.counterparty?.job_title && (
                        <p className={`text-sm truncate mb-1 ${hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {chat.counterparty.job_title}
                        </p>
                      )}
                      
                      {/* Message count */}
                      <p className="text-xs text-muted-foreground">
                        {Number(chat.message_count) || 0} message{(Number(chat.message_count) || 0) !== 1 ? 's' : ''}
                      </p>
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