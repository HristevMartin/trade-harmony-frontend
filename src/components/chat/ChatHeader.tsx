import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, PhoneOff, VideoOff, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [showJobDetails, setShowJobDetails] = useState(false);
  
  const counterpartyInitials = counterparty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-md pt-safe-top" style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between h-[60px] px-4">
            {/* Left: Mobile conversations button, Back button and counterparty info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {onOpenSidebar && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onOpenSidebar}
                  className="sm:hidden flex-shrink-0 min-h-[44px] px-4 text-sm font-semibold shadow-sm"
                  aria-label="Open conversations"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conversations
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
                  <div className="flex items-center gap-2">
                    <h1 className="font-semibold text-foreground leading-none truncate text-base">
                      {counterparty.name}
                    </h1>
                    {counterparty.role === 'homeowner' && (
                      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost" 
                            size="sm"
                            className="flex-shrink-0 p-1 h-6 w-6 rounded-full hover:bg-muted/80"
                            aria-label="View job details"
                          >
                            <HelpCircle className="w-4 h-4 text-orange-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Job Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Project Title</h3>
                              <p className="text-sm">{conversation.jobTitle}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Homeowner</h3>
                              <p className="text-sm">{counterparty.name}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                              <p className="text-sm capitalize">{conversation.status}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
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
            </div>
          </div>
        </header>
  );
};

export default ChatHeader;