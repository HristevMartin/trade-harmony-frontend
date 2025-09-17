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
    <div className="w-72 bg-card border-r border-border p-6 space-y-6 hidden md:block">
      {/* Contact Info */}
      <div className="text-center">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {counterpartyInitials}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{counterparty.name}</h3>
        <p className="text-sm text-muted-foreground capitalize">
          {counterparty.role === 'trader' ? 'Professional Trader' : 'Homeowner'}
        </p>
      </div>

      <Separator />

      {/* Project Info */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Project</h4>
          <p className="text-sm text-muted-foreground">{conversation.jobTitle}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Status</h4>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              conversation.status === 'open' ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-muted-foreground capitalize">
              {conversation.status}
            </span>
          </div>
        </div>

        {/* Contact Sharing Status */}
        <div>
          <h4 className="font-medium mb-2">Contact Sharing</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <Badge variant={conversation.canViewPhone ? "default" : "secondary"}>
                {conversation.canViewPhone ? 'Shared' : 'Hidden'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <Badge variant={conversation.canViewEmail ? "default" : "secondary"}>
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
          <Button variant="outline" className="w-full justify-start">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full justify-start opacity-50" 
            disabled
            onClick={() => onToggleContactDemo('phone')}
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Phone Hidden
          </Button>
        )}
        
        {conversation.canViewEmail ? (
          <Button variant="outline" className="w-full justify-start">
            <Video className="w-4 h-4 mr-2" />
            Video Call
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full justify-start opacity-50" 
            disabled
            onClick={() => onToggleContactDemo('email')}
          >
            <MailIcon className="w-4 h-4 mr-2 opacity-50" />
            Email Hidden
          </Button>
        )}
        
        <Button variant="outline" className="w-full justify-start">
          <User className="w-4 h-4 mr-2" />
          View Profile
        </Button>

        {!conversation.canViewPhone && !conversation.canViewEmail && (
          <>
            <Separator />
            <Button 
              onClick={onRequestContact}
              className="w-full"
            >
              Request Contact Details
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Ask the {counterparty.role} to share their contact information
            </p>
          </>
        )}

        {/* Demo Toggle Buttons */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Demo Controls:</p>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => onToggleContactDemo('phone')}
            >
              Toggle Phone Access
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
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