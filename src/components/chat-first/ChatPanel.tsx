import React, { useEffect, useState } from 'react';
import { useChatStore } from './ChatStore';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import ConversationBadge from './ConversationBadge';
import { COPY_STRINGS } from './constants';

interface ChatPanelProps {
  conversationId: string;
  currentUserId: string;
  homeownerName: string;
  traderName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  conversationId, 
  currentUserId, 
  homeownerName, 
  traderName 
}) => {
  const { state, store } = useChatStore();
  const [messages, setMessages] = useState(state.messages[conversationId] || []);
  const [isPolling, setIsPolling] = useState(true);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!isPolling) return;

    const pollMessages = async () => {
      try {
        const latestMessages = await store.listMessages(conversationId);
        setMessages(latestMessages);
      } catch (error) {
        console.error('Failed to poll messages:', error);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    
    // Initial load
    pollMessages();

    return () => clearInterval(interval);
  }, [conversationId, store, isPolling]);

  // Update messages when store changes
  useEffect(() => {
    const storeMessages = state.messages[conversationId] || [];
    setMessages(storeMessages);
  }, [state.messages, conversationId]);

  const handleSendMessage = async (body: string, attachments?: File[]) => {
    try {
      await store.sendMessage({
        conversationId,
        senderId: currentUserId,
        body,
        attachments,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (state.error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-destructive mb-3">{COPY_STRINGS.ERROR_RETRY}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:underline"
          >
            {COPY_STRINGS.RETRY}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with badge */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Chat</h3>
        <ConversationBadge />
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        homeownerName={homeownerName}
        traderName={traderName}
      />

      {/* Composer */}
      <MessageComposer
        onSendMessage={handleSendMessage}
        disabled={state.loading}
      />

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Chat live
      </div>
    </div>
  );
};

export default ChatPanel;
