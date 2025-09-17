import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, PhoneOff, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between p-4">
        {/* Left: Back button and counterparty info */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {counterpartyInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <h1 className="font-semibold text-foreground leading-none">
                {counterparty.name}
              </h1>
              <p className="text-sm text-muted-foreground leading-none mt-1">
                {conversation.jobTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
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
              className="hidden sm:flex"
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