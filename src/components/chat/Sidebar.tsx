import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Conversation, UserRef } from './useChatStore';
import { useEffect, useState } from 'react';

interface SidebarProps {
  conversation: Conversation;
  counterparty: UserRef;
  currentUserId: string;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversation, 
  counterparty,
  currentUserId,
  onClose
}) => {
  const counterpartyInitials = counterparty?.name
    ? counterparty.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : '??';

  //  useEffect(() =>{
  //     const request = async () => {
  //       const response = await fetch(`/api/conversations/${conversation.id}`);
  //       const data = await response.json();
  //       console.log(data);
  //     }
  //     request();
  // }, [])

  const handleConversationClick = () => {
    // If this is already the current conversation, just close mobile drawer
    if (onClose) {
      onClose();
      return;
    }
    
    // For now, just refresh the current conversation
    // You can modify this to navigate to different conversations when you have multiple
    window.location.reload();
  };



  return (
    <div style={{border: '2px solid blue'}} className="w-full bg-card border-r border-border flex flex-col overflow-hidden h-full">
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
      
      {/* Current Conversation */}
      <div className={`p-4 ${onClose ? 'sm:border-b' : 'border-b'}`}>
        {!onClose && (
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Current Chat
          </h3>
        )}
        
        {counterparty ? (
          <button 
            className="w-full bg-primary/10 border-primary border rounded-2xl p-4 hover:bg-primary/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            onClick={() => {
              // You can add navigation logic here if needed
              console.log('Clicked on conversation with:', counterparty.name);
            }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 flex-shrink-0">
                {counterparty.avatarUrl ? (
                  <AvatarImage src={counterparty.avatarUrl} alt={counterparty.name} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {counterpartyInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-foreground truncate">
                  {counterparty.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation?.jobTitle || 'Active conversation'}
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  Currently chatting
                </p>
              </div>
            </div>
          </button>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No active conversation</p>
          </div>
        )}
      </div>
    
    </div>
  );
};

export default Sidebar;