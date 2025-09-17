import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, PhoneOff, VideoOff, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Conversation, UserRef } from './useChatStore';

interface ChatHeaderProps {
  conversation: Conversation;
  counterparty: UserRef;
  onRequestContact: () => void;
  onOpenSidebar?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  conversation, 
  counterparty, 
  onRequestContact,
  onOpenSidebar
}) => {
  const navigate = useNavigate();
  
  const counterpartyInitials = counterparty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm pt-safe-top">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left: Mobile conversations button, Back button and counterparty info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {onOpenSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenSidebar}
                  className="sm:hidden hover:bg-muted flex-shrink-0 min-h-[44px] min-w-[44px]"
                  aria-label="Open conversations"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-muted flex-shrink-0 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="w-11 h-11 flex-shrink-0">
                  {counterparty.avatarUrl ? (
                    <AvatarImage src={counterparty.avatarUrl} alt={counterparty.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {counterpartyInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="font-semibold text-foreground leading-none truncate text-base">
                    {counterparty.name}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-none mt-1 truncate">
                    {conversation.jobTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <TooltipProvider>
                {conversation.canViewPhone ? (
                  <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px]">
                    <Phone className="w-4 h-4" />
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px]" disabled>
                        <PhoneOff className="w-4 h-4 opacity-50" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Phone hidden</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {conversation.canViewEmail ? (
                  <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px]">
                    <Video className="w-4 h-4" />
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px]" disabled>
                        <VideoOff className="w-4 h-4 opacity-50" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Email hidden</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
              
              {!conversation.canViewPhone && !conversation.canViewEmail && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRequestContact}
                  className="hidden md:flex text-xs px-3 min-h-[44px]"
                >
                  Request contact
                </Button>
              )}
              
              <Button variant="ghost" size="sm" className="min-h-[44px]">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>
  );
};

export default ChatHeader;