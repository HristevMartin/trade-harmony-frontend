import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronDown } from 'lucide-react';
import type { Message, Conversation, UserRef } from './useChatStore';

interface MessageListProps {
  messages: Message[];
  conversation: Conversation;
  currentUserId: string;
  counterparty: UserRef;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  conversation,
  currentUserId,
  counterparty
  }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolled, setIsUserScrolled] = useState(false);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    setShowScrollToBottom(false);
  };

  const checkScrollPosition = () => {
    if (!listRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
    
    setIsUserScrolled(!isAtBottom);
    setShowScrollToBottom(!isAtBottom && messages.length > 0);
  };

  // Removed auto-scroll on new messages

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSenderInfo = (senderId: string) => {
    if (senderId === currentUserId) {
      return { name: '', isMe: true }; // Remove "You" label
    }
    return { name: counterparty?.name || 'Other User', isMe: false };
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-16 text-center">
        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-3">No messages yet</h3>
        <p className="text-muted-foreground/80 max-w-sm leading-relaxed">Say hello to get the conversation started!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div 
        ref={listRef}
        className="h-[calc(100svh-60px-140px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:h-[calc(100dvh-60px-140px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto px-4 sm:px-6 py-6 space-y-2" 
        onScroll={checkScrollPosition}
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message, index) => {
          const senderInfo = getSenderInfo(message.senderId);
          const senderInitials = senderInfo.name 
            ? senderInfo.name.split(' ').map(n => n[0]).join('').toUpperCase() 
            : (counterparty?.name || 'OU').split(' ').map(n => n[0]).join('').toUpperCase();
          const prevMessage = messages[index - 1];
          const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
          const isLastInGroup = !messages[index + 1] || messages[index + 1].senderId !== message.senderId;
          
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${senderInfo.isMe ? 'flex-row-reverse' : 'flex-row'} ${isLastInGroup ? 'mb-4' : 'mb-2'}`}
            >
              {!senderInfo.isMe && (
                <div className="w-7 flex-shrink-0">
                  {showAvatar ? (
                    <Avatar className="w-7 h-7">
                      {counterparty?.avatarUrl ? (
                        <AvatarImage src={counterparty.avatarUrl} alt={counterparty.name || 'User'} />
                      ) : null}
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {senderInitials}
                      </AvatarFallback>
                    </Avatar>
                  ) : null}
                </div>
              )}
              
              <div className={`flex flex-col ${senderInfo.isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                {showAvatar && !senderInfo.isMe && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-medium">
                      {senderInfo.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                )}
                
                <div
                  className={`rounded-2xl px-4 py-3 max-w-full break-words ${
                    senderInfo.isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  } ${message.pending ? 'opacity-70' : ''}`}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{message.body}</p>
                  {message.pending && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                      <span className="text-xs opacity-70">Sending...</span>
                    </div>
                  )}
                </div>
                
                {/* Timestamp for my messages */}
                {senderInfo.isMe && showAvatar && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.createdAt)}
                  </span>
                )}
              </div>
              
              {senderInfo.isMe && (
                <div className="w-7 flex-shrink-0" />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Jump to latest button */}
      {showScrollToBottom && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg min-h-[44px] min-w-[44px] px-3"
          aria-label="Jump to latest message"
        >
          <ChevronDown className="w-4 h-4 mr-1" />
          <span className="text-xs">Jump to latest</span>
        </Button>
      )}
    </div>
  );
};

export default MessageList;