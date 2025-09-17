import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Video, User, Mail, PhoneOff, Mail as MailIcon, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation, UserRef } from './useChatStore';
import { useChatStore } from './useChatStore';

interface SidebarProps {
  conversation: Conversation;
  counterparty: UserRef;
  currentUserId: string;
  onRequestContact: () => void;
  onToggleContactDemo: (type: 'phone' | 'email') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversation, 
  counterparty,
  currentUserId,
  onRequestContact,
  onToggleContactDemo
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { listConversations, listMessages } = useChatStore();
  
  const conversations = listConversations();
  const counterpartyInitials = counterparty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleConversationSelect = (convId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('conversation_id', convId);
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <div className="w-80 bg-card border-r border-border hidden lg:flex flex-col overflow-hidden">
      {/* Conversations List */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Conversations
        </h3>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {conversations.map((conv) => {
              const otherParty = conv.homeowner.id === currentUserId ? conv.trader : conv.homeowner;
              const lastMessages = listMessages(conv.id);
              const lastMessage = lastMessages[lastMessages.length - 1];
              const otherInitials = otherParty.name.split(' ').map(n => n[0]).join('').toUpperCase();
              
              return (
                <button
                  key={conv.id}
                  onClick={() => handleConversationSelect(conv.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                    conv.id === conversation.id ? 'bg-muted border-primary' : 'bg-background border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      {otherParty.avatarUrl && (
                        <AvatarImage src={otherParty.avatarUrl} alt={otherParty.name} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {otherInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-foreground truncate">
                          {otherParty.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(lastMessage?.createdAt || conv.createdAt)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.jobTitle}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {lastMessage.body}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Current Contact Info */}
      <div className="p-4 space-y-4">
        <div className="text-center">
          <Avatar className="w-16 h-16 mx-auto mb-3 shadow-lg">
            {counterparty.avatarUrl && (
              <AvatarImage src={counterparty.avatarUrl} alt={counterparty.name} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-semibold">
              {counterpartyInitials}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg text-foreground">{counterparty.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {counterparty.role === 'trader' ? 'Professional Trader' : 'Homeowner'}
          </p>
        </div>

        {/* Contact Actions */}
        <div className="space-y-2">
          {conversation.canViewPhone ? (
            <Button variant="outline" className="w-full justify-start text-sm">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs opacity-50" disabled>
              <PhoneOff className="w-4 h-4 mr-2" />
              Phone Hidden
            </Button>
          )}
          
          {conversation.canViewEmail ? (
            <Button variant="outline" className="w-full justify-start text-sm">
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs opacity-50" disabled>
              <MailIcon className="w-4 h-4 mr-2" />
              Email Hidden
            </Button>
          )}

          {!conversation.canViewPhone && !conversation.canViewEmail && (
            <Button 
              onClick={onRequestContact}
              variant="default"
              className="w-full text-sm"
            >
              Request Contact Details
            </Button>
          )}
        </div>

        {/* Demo Controls */}
        <div className="pt-3 border-t space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Demo Controls:</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs justify-start"
            onClick={() => onToggleContactDemo('phone')}
          >
            Toggle Phone Access
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs justify-start"
            onClick={() => onToggleContactDemo('email')}
          >
            Toggle Email Access
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;