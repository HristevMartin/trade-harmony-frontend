import React, { useEffect, useRef } from 'react';
import { Message } from './types';
import { COPY_STRINGS } from './constants';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  homeownerName: string;
  traderName: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId, 
  homeownerName, 
  traderName 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSenderName = (senderId: string) => {
    return senderId === currentUserId ? traderName : homeownerName;
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            💬
          </div>
          <p className="text-sm">{COPY_STRINGS.EMPTY_CHAT}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId;
        const senderName = getSenderName(message.senderId);
        
        return (
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
              {/* Sender name and timestamp */}
              <div className={`text-xs text-muted-foreground mb-1 ${
                isCurrentUser ? 'text-right' : 'text-left'
              }`}>
                <span className="font-medium">{senderName}</span>
                <span className="ml-2">{formatTime(message.createdAt)}</span>
              </div>
              
              {/* Message bubble */}
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/80 text-foreground'
                } ${message.pending ? 'opacity-60' : ''}`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.body}
                </p>
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={`text-xs px-2 py-1 rounded ${
                          isCurrentUser
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-background text-foreground'
                        }`}
                      >
                        📎 {attachment.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pending indicator */}
                {message.pending && (
                  <div className="mt-1 flex items-center gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                    <span className="text-xs opacity-70">Sending...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
