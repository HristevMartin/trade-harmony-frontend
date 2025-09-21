import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { HiCheckCircle } from 'react-icons/hi2';
import { PaymentSuccessModalProps, ChatStage, Conversation } from './types';
import { COPY_STRINGS } from './constants';
// Removed mock ChatStore - using real API instead
import ChatIntro from './ChatIntro';
import ChatPanel from './ChatPanel';

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  jobId,
  homeowner,
  trader,
  existingConversationId
}) => {
  const [stage, setStage] = useState<ChatStage>('success');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Initialize stage based on existing conversation
  useEffect(() => {
    if (isOpen) {
      if (existingConversationId) {
        setStage('chat_intro');
        // Mock conversation object for existing conversation
        setConversation({
          id: existingConversationId,
          jobId,
          homeownerId: homeowner.id,
          traderId: trader.id,
          createdAt: Date.now(),
          status: 'open'
        });
      } else {
        setStage('success');
      }
    }
  }, [isOpen, existingConversationId, jobId, homeowner.id, trader.id]);

  const handleContinueToChat = () => {
    console.log('🎯 Continue to Chat clicked!');
    console.log('📋 Current props:', { jobId, homeowner, trader });
    setStage('chat_intro');
  };

  const handleSendAndOpenChat = async (message: string) => {
    console.log('🚀 Starting handleSendAndOpenChat with message:', message);
    console.log('📋 JobId:', jobId, 'Homeowner:', homeowner, 'Trader:', trader);
    
    setIsCreatingConversation(true);
    
    try {

      const authToken = localStorage.getItem('access_token');
      const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const currentUserId = authUser.id || trader.id;
      const apiUrl = import.meta.env.VITE_API_URL;
      

      console.log('🔧 API URL:', apiUrl);
      console.log('👤 Auth User:', authUser);
      console.log('🔑 Auth Token:', authToken ? 'Present' : 'Missing');
      
      let conversationId = conversation?.id;
      
      // Create conversation if it doesn't exist
      if (!conversationId) {
        console.log('📞 Creating conversation with API...');
        const createResponse = await fetch(`${apiUrl}/travel/chat-component/create-chat`, {

          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_id: jobId,
            trader_id: currentUserId,
          }),
        });
        
        console.log('📞 Create conversation response:', createResponse.status, createResponse.statusText);
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          console.error('❌ Failed to create conversation:', errorData);
          throw new Error('Failed to create conversation');
        }
        
        const createData = await createResponse.json();
        console.log('✅ Conversation created:', createData);
        conversationId = createData.conversation?.conversation_id;
        
        if (!conversationId) {
          throw new Error('No conversation ID returned');
        }
        
        // Update local conversation state
        setConversation({
          id: conversationId,
          jobId,
          homeownerId: homeowner.id,
          traderId: currentUserId,
          createdAt: Date.now(),
          status: 'open'
        });
      }

      // Send the first message using real API
      if (conversationId && authToken) {
        console.log('💬 Sending message...');
        const sendResponse = await fetch(`${apiUrl}/travel/chat-component`, {

          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: conversationId,
            body: message,
            action: "send_message"
          })
        });
        
        console.log('💬 Send message response:', sendResponse.status, sendResponse.statusText);
        
        if (!sendResponse.ok) {
          console.error('Failed to send message, but continuing to chat');
        } else {
          console.log('✅ Message sent successfully');
        }
      }

      // Build chat URL with parameters and navigate
      const params = new URLSearchParams();
      params.set('job_id', jobId);
      params.set('homeowner_name', homeowner.name);
      params.set('trader_name', trader.name);
      params.set('job_title', `Job #${jobId}`);
      
      const chatUrl = `/chat?${params.toString()}`;
      
      console.log('🌐 Navigating to chat URL:', chatUrl);
      console.log('📋 URL Parameters:', {
        job_id: jobId,
        homeowner_name: homeowner.name,
        trader_name: trader.name,
        job_title: `Job #${jobId}`
      });
      
      // Navigate to chat
      window.location.href = chatUrl;
      
    } catch (error) {
      console.error('❌ Error in handleSendAndOpenChat:', error);
      // Even if there's an error, still try to navigate to chat
      const params = new URLSearchParams();
      params.set('job_id', jobId);
      params.set('homeowner_name', homeowner.name);
      params.set('trader_name', trader.name);
      params.set('job_title', `Job #${jobId}`);
      
      const chatUrl = `/chat?${params.toString()}`;
      console.log('🔄 Fallback navigation to:', chatUrl);
      window.location.href = chatUrl;
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleClose = () => {
    setStage('success');
    setConversation(null);
    onClose();
  };

  const renderSuccessStage = () => (
    <div className="space-y-6 text-center animate-fade-up">
      {/* Success Header */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <HiCheckCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            {/* Celebration rings */}
            <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping"></div>
            <div className="absolute inset-[-8px] rounded-full border-2 border-green-300/20 animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {COPY_STRINGS.TITLE}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed px-2">
            {COPY_STRINGS.SUBTITLE}
          </p>
        </div>
      </div>

      {/* Benefits reminder */}
      <div className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
        <div className="space-y-3">
          <h3 className="font-semibold text-blue-900 text-sm md:text-base">What happens next?</h3>
          <div className="space-y-2 text-left">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-xs md:text-sm text-blue-800">Start a conversation to introduce yourself</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-xs md:text-sm text-blue-800">Share your availability and competitive quote</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-xs md:text-sm text-blue-800">Get access to homeowner's contact details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleContinueToChat}
          className="flex-1 bg-gradient-to-r from-trust-blue to-blue-600 hover:from-trust-blue/90 hover:to-blue-600/90 text-white font-semibold py-3 md:py-4 text-sm md:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          aria-label="Continue to chat"
        >
          Continue to Chat
        </Button>
        <Button
          variant="outline"
          onClick={handleClose}
          className="sm:w-auto border-2 py-3 md:py-4 font-medium"
          aria-label="Close modal"
        >
          {COPY_STRINGS.CLOSE}
        </Button>
      </div>
    </div>
  );

  const renderChatLiveStage = () => {
    return conversation ? (
      <div className="h-[60vh] md:h-[70vh] flex flex-col">
        <ChatPanel
          conversationId={conversation.id}
          currentUserId={trader.id}
          homeownerName={homeowner.name}
          traderName={trader.name}
        />
      </div>
    ) : null;
  };

  const renderContent = () => {
    switch (stage) {
      case 'success':
        return renderSuccessStage();
      case 'chat_intro':
        return (
          <ChatIntro
            homeownerName={homeowner.name}
            onSendAndOpenChat={handleSendAndOpenChat}
            onClose={handleClose}
            isLoading={isCreatingConversation}
          />
        );
      case 'chat_live':
        return renderChatLiveStage();
      default:
        return null;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="xl"
      showCloseButton={stage !== 'chat_live'}
    >
      <div className="max-h-[85vh] overflow-y-auto scrollbar-hide">
        {renderContent()}
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {stage === 'success' && 'Payment successful'}
        {stage === 'chat_intro' && 'Chat introduction'}
        {stage === 'chat_live' && 'Chat live'}
      </div>
    </Modal>
  );
};

export default PaymentSuccessModal;