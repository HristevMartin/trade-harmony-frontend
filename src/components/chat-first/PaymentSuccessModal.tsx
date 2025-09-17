import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { HiCheckCircle, HiXMark } from 'react-icons/hi2';
import { PaymentSuccessModalProps, ChatStage, Conversation } from './types';
import { COPY_STRINGS } from './constants';
import { useChatStore } from './ChatStore';
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
  const { store } = useChatStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (event.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleContinueToChat = () => {
    setStage('chat_intro');
  };

  const handleSendAndOpenChat = async (message: string) => {
    setIsCreatingConversation(true);
    
    try {
      let conv = conversation;
      
      if (!conv) {
        conv = await store.createOrGetConversation({
          jobId,
          homeownerId: homeowner.id,
          traderId: trader.id,
        });
        setConversation(conv);
      }

      // Send the first message
      await store.sendMessage({
        conversationId: conv.id,
        senderId: trader.id,
        body: message,
      });

      // Build chat URL with parameters and open in new tab
      const params = new URLSearchParams();
      params.set('conversation_id', conv.id);
      params.set('homeowner_name', homeowner.name);
      params.set('trader_name', trader.name);
      params.set('current_user_id', trader.id);
      params.set('job_title', `Job #${jobId}`);
      
      const chatUrl = `/chat?${params.toString()}`;
      window.open(chatUrl, '_blank');
      
      // Close the modal
      handleClose();
    } catch (error) {
      console.error('Failed to create conversation or send message:', error);
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
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center pb-6 border-b border-border">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <HiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {COPY_STRINGS.TITLE}
        </h2>
        <p className="text-muted-foreground">
          {COPY_STRINGS.SUBTITLE}
        </p>
      </div>

      {/* Action */}
      <div className="flex gap-3">
        <Button
          onClick={handleContinueToChat}
          className="flex-1"
          aria-label="Continue to chat"
        >
          Continue to Chat
        </Button>
        <Button
          variant="outline"
          onClick={handleClose}
          aria-label="Close modal"
        >
          {COPY_STRINGS.CLOSE}
        </Button>
      </div>
    </div>
  );

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
        return conversation ? (
          <div className="h-[500px]">
            <ChatPanel
              conversationId={conversation.id}
              currentUserId={trader.id}
              homeownerName={homeowner.name}
              traderName={trader.name}
            />
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div
        ref={modalRef}
        className="relative bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-success-title"
        aria-describedby="payment-success-description"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground z-10"
          aria-label="Close modal"
        >
          <HiXMark className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {stage === 'success' && 'Payment successful'}
          {stage === 'chat_intro' && 'Chat introduction'}
          {stage === 'chat_live' && 'Chat live'}
        </div>
      </div>
    </Modal>
  );
};

export default PaymentSuccessModal;
