import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSenderInfo = (senderId: string) => {
    if (senderId === currentUserId) {
      return { name: 'You', isMe: true };
    }
    return { name: counterparty.name, isMe: false };
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
        <p className="text-sm text-muted-foreground">Say hello to get the conversation started!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const senderInfo = getSenderInfo(message.senderId);
        const senderInitials = senderInfo.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return (
          <div
            key={message.id}
            className={`flex gap-3 ${senderInfo.isMe ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {!senderInfo.isMe && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                {counterparty.avatarUrl && (
                  <AvatarImage src={counterparty.avatarUrl} alt={counterparty.name} />
                )}
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {senderInitials}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={`flex flex-col ${senderInfo.isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
              <div className={`flex items-center gap-2 mb-1 ${senderInfo.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-xs text-muted-foreground font-medium">
                  {senderInfo.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.createdAt)}
                </span>
              </div>
              
              <div
                className={`rounded-2xl px-4 py-2 max-w-full break-words ${
                  senderInfo.isMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                } ${message.pending ? 'opacity-70' : ''}`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                {message.pending && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                    <span className="text-xs opacity-70">Sending...</span>
                  </div>
                )}
              </div>
            </div>
            
            {senderInfo.isMe && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {senderInitials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;