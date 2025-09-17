import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, PhoneOff, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Conversation, UserRef } from './useChatStore';

interface ChatHeaderProps {
  conversation: Conversation;
  counterparty: UserRef;
  onRequestContact: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  conversation, 
  counterparty, 
  onRequestContact 
}) => {
  const navigate = useNavigate();
  
  const counterpartyInitials = counterparty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
          <div className="flex items-center justify-between p-4">
            {/* Left: Back button and counterparty info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-muted flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  {counterparty.avatarUrl && (
                    <AvatarImage src={counterparty.avatarUrl} alt={counterparty.name} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {counterpartyInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="font-semibold text-foreground leading-none truncate">
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
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Phone className="w-4 h-4" />
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="hidden sm:flex" disabled>
                        <PhoneOff className="w-4 h-4 opacity-50" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Phone hidden</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {conversation.canViewEmail ? (
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Video className="w-4 h-4" />
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="hidden sm:flex" disabled>
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
                  className="hidden md:flex text-xs px-3"
                >
                  Request contact
                </Button>
              )}
              
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>
  );
};

export default ChatHeader;