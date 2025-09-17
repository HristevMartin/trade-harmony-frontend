import React from 'react';
import { Phone, Video, User, Mail, PhoneOff, Mail as MailIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Conversation, UserRef } from './useChatStore';

interface SidebarProps {
  conversation: Conversation;
  counterparty: UserRef;
  onRequestContact: () => void;
  onToggleContactDemo: (type: 'phone' | 'email') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversation, 
  counterparty, 
  onRequestContact,
  onToggleContactDemo
}) => {
  const counterpartyInitials = counterparty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="w-80 bg-card border-r border-border p-4 md:p-6 space-y-4 md:space-y-6 hidden lg:block overflow-y-auto">
      {/* Contact Info */}
      <div className="text-center">
        <Avatar className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg md:text-xl font-semibold">
            {counterpartyInitials}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg md:text-xl text-foreground">{counterparty.name}</h3>
        <p className="text-sm text-muted-foreground capitalize mt-1">
          {counterparty.role === 'trader' ? 'Professional Trader' : 'Homeowner'}
        </p>
      </div>

      <Separator />

      {/* Project Info */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2 text-foreground">Project</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{conversation.jobTitle}</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2 text-foreground">Status</h4>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              conversation.status === 'open' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-muted-foreground capitalize font-medium">
              {conversation.status}
            </span>
          </div>
        </div>

        {/* Contact Sharing Status */}
        <div>
          <h4 className="font-semibold mb-3 text-foreground">Contact Sharing</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground font-medium">Phone</span>
              <Badge variant={conversation.canViewPhone ? "default" : "secondary"} className="text-xs">
                {conversation.canViewPhone ? 'Shared' : 'Hidden'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground font-medium">Email</span>
              <Badge variant={conversation.canViewEmail ? "default" : "secondary"} className="text-xs">
                {conversation.canViewEmail ? 'Shared' : 'Hidden'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-3">
        {conversation.canViewPhone ? (
          <Button variant="outline" className="w-full justify-start font-medium shadow-sm hover:shadow-md transition-all">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full justify-start opacity-50 cursor-not-allowed" 
            disabled
            onClick={() => onToggleContactDemo('phone')}
          >
            <PhoneOff className="w-4 h-4 mr-2 opacity-50" />
            Phone Hidden
          </Button>
        )}
        
        {conversation.canViewEmail ? (
          <Button variant="outline" className="w-full justify-start font-medium shadow-sm hover:shadow-md transition-all">
            <Video className="w-4 h-4 mr-2" />
            Video Call
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full justify-start opacity-50 cursor-not-allowed" 
            disabled
            onClick={() => onToggleContactDemo('email')}
          >
            <MailIcon className="w-4 h-4 mr-2 opacity-50" />
            Email Hidden
          </Button>
        )}
        
        <Button variant="outline" className="w-full justify-start font-medium shadow-sm hover:shadow-md transition-all">
          <User className="w-4 h-4 mr-2" />
          View Profile
        </Button>

        {!conversation.canViewPhone && !conversation.canViewEmail && (
          <>
            <Separator />
            <Button 
              onClick={onRequestContact}
              className="w-full bg-gradient-to-r from-trust-blue to-blue-600 hover:from-trust-blue/90 hover:to-blue-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              Request Contact Details
            </Button>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Ask the {counterparty.role} to share their contact information
            </p>
          </>
        )}

        {/* Demo Toggle Buttons */}
        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Demo Controls:</p>
          <div className="grid grid-cols-1 gap-2">
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
    </div>
  );
};

export default Sidebar;