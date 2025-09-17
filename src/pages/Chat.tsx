import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatProvider } from '@/components/chat-first';
import ChatPanel from '@/components/chat-first/ChatPanel';
import { Separator } from '@/components/ui/separator';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get parameters from URL
  const conversationId = searchParams.get('conversation_id') || '';
  const homeownerName = searchParams.get('homeowner_name') || 'Homeowner';
  const traderName = searchParams.get('trader_name') || 'Trader';
  const currentUserId = searchParams.get('current_user_id') || 'user_123';
  const jobTitle = searchParams.get('job_title') || 'Project Discussion';
  
  // Determine chat partner based on current user
  const chatPartnerName = currentUserId.includes('homeowner') ? traderName : homeownerName;
  const chatPartnerInitials = chatPartnerName.split(' ').map(n => n[0]).join('');

  if (!conversationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chat Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This chat conversation could not be found.
          </p>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile/Desktop Header */}
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="flex items-center justify-between p-4">
            {/* Left: Back button and user info */}
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
                    {chatPartnerInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col">
                  <h1 className="font-semibold text-foreground leading-none">
                    {chatPartnerName}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-none mt-1">
                    {jobTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Contact Info */}
          <div className="w-72 bg-card border-r border-border p-6 space-y-6 hidden md:block">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {chatPartnerInitials}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{chatPartnerName}</h3>
              <p className="text-sm text-muted-foreground">Professional Trader</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Project</h4>
                <p className="text-sm text-muted-foreground">{jobTitle}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Video className="w-4 h-4 mr-2" />
                Video Call
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatPanel
              conversationId={conversationId}
              currentUserId={currentUserId}
              homeownerName={homeownerName}
              traderName={traderName}
            />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default Chat;