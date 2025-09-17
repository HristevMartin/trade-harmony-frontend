import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageComposer from '@/components/chat/MessageComposer';
import Sidebar from '@/components/chat/Sidebar';
import { useChatStore } from '@/components/chat/useChatStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getConversation, createOrGetConversation, listMessages, listConversations, sendMessage, toggleContactSharing } = useChatStore();
  
  // Get parameters from URL - but derive names from conversation data
  const conversationId = searchParams.get('conversation_id') || '';
  const currentUserId = searchParams.get('current_user_id') || '68ac564b8ee4f90af6a56a108';
  const homeownerName = searchParams.get('homeowner_name') || 'Martin';
  const traderName = searchParams.get('trader_name') || 'You';
  const jobTitle = searchParams.get('job_title') || 'Project Discussion';

  console.log('Chat component - URL params:', {
    conversationId,
    currentUserId,
    homeownerName,  
    traderName,
    jobTitle
  });

  // Try to get existing conversation, create one, or use default
  let conversation = getConversation(conversationId);
  
  if (!conversation && conversationId) {
    console.log('Conversation not found, creating new one');
    conversation = createOrGetConversation({
      conversationId,
      jobTitle,
      homeowner: {
        id: 'homeowner_martin_789',
        name: homeownerName
      },
      trader: {
        id: currentUserId,
        name: traderName
      }
    });
  }

  // If no conversation ID provided or conversation not found, use the first available conversation
  if (!conversation) {
    const allConversations = listConversations();
    if (allConversations.length > 0) {
      conversation = allConversations[0];
      // Update URL to reflect the selected conversation
      const newParams = new URLSearchParams(searchParams);
      newParams.set('conversation_id', conversation.id);
      navigate(`/chat?${newParams.toString()}`, { replace: true });
    }
  }

  const messages = listMessages(conversationId);

  if (!conversation) {
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

  // Derive counterparty from conversation data - CRITICAL LOGIC
  const me = [conversation.homeowner, conversation.trader].find(p => p.id === currentUserId)!;
  const counterparty = conversation.homeowner.id === currentUserId ? conversation.trader : conversation.homeowner;

  if (!me) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have access to this conversation.
          </p>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (body: string) => {
    await sendMessage({
      conversationId,
      senderId: currentUserId,
      body
    });
  };

  const handleRequestContact = () => {
    // In a real app, this would send a request to the other party
    console.log('Requesting contact details from', counterparty.name);
  };

  const handleToggleContactDemo = (type: 'phone' | 'email') => {
    toggleContactSharing(conversationId, type);
  };

  const handleGoBack = () => {
    // Check if there's history to go back to, otherwise go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1320px] mx-auto px-6">
        <ChatHeader 
          conversation={conversation}
          counterparty={counterparty}
          onRequestContact={handleRequestContact}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="flex h-[calc(100dvh-60px-env(safe-area-inset-top))] relative">
          {/* Desktop Sidebar */}
          <div className="hidden sm:block w-[340px] flex-shrink-0">
            <Sidebar
              conversation={conversation}
              counterparty={counterparty}
              currentUserId={currentUserId}
              onRequestContact={handleRequestContact}  
              onToggleContactDemo={handleToggleContactDemo}
            />
          </div>

          {/* Mobile Sidebar Drawer */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent 
              side="left" 
              className="w-[96vw] min-w-0 max-w-[420px] p-0 sm:hidden backdrop-blur-sm"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="relative bg-background h-full">
                <Sidebar
                  conversation={conversation}
                  counterparty={counterparty}
                  currentUserId={currentUserId}
                  onRequestContact={handleRequestContact}  
                  onToggleContactDemo={handleToggleContactDemo}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-background text-base text-[16px] leading-relaxed">
            <MessageList
              messages={messages}
              conversation={conversation}
              currentUserId={currentUserId}
              counterparty={counterparty}
            />

            <MessageComposer
              onSendMessage={handleSendMessage}
              conversationStatus={conversation.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;