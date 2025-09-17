import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageComposer from '@/components/chat/MessageComposer';
import Sidebar from '@/components/chat/Sidebar';
import { useChatStore } from '@/components/chat/useChatStore';
import { Button } from '@/components/ui/button';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getConversation, createOrGetConversation, listMessages, sendMessage, toggleContactSharing } = useChatStore();
  
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

  // Try to get existing conversation, or create it if it doesn't exist
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
      <ChatHeader 
        conversation={conversation}
        counterparty={counterparty}
        onRequestContact={handleRequestContact}
      />

      <div className="flex h-[calc(100vh-73px)] relative">
        <Sidebar
          conversation={conversation}
          counterparty={counterparty}
          onRequestContact={handleRequestContact}
          onToggleContactDemo={handleToggleContactDemo}
        />

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
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

        {/* Mobile sidebar toggle - could be added later */}
        {/* <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button size="sm" variant="outline" className="rounded-full shadow-lg">
            <User className="w-4 h-4" />
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default Chat;