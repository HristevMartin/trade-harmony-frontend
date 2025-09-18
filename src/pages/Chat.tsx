import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import MessageList from '@/components/chat/MessageList';
import Sidebar from '@/components/chat/Sidebar';
import { useChatStore } from '@/components/chat/useChatStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversationId, setConversationId] = useState('');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { listMessages } = useChatStore();
  
  // Get parameters from URL
  const jobId = searchParams.get('job_id');
  const homeownerName = searchParams.get('homeowner_name');
  const traderName = searchParams.get('trader_name');
  const jobTitle = searchParams.get('job_title');
  
  // Get current user from localStorage
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const currentUserId = authUser.id;
  const authToken = localStorage.getItem('access_token');

  useEffect(() => {
    const request = async () => {
      if (!conversationId) {
        console.log('No conversationId yet, skipping message fetch');
        setIsLoadingMessages(false);
        return;
      }
      
      console.log('Fetching messages for conversationId:', conversationId);
      setIsLoadingMessages(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/travel/chat-component/${conversationId}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Messages API response:', data);
          
          // Transform API messages to match the expected format
          const transformedMessages = data.messages?.map(msg => ({
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            body: msg.body,
            createdAt: new Date(msg.created_at).getTime(),
            attachments: msg.attachments_json ? JSON.parse(msg.attachments_json) : []
          })) || [];
          
          console.log('Transformed messages:', transformedMessages);
          setMessages(transformedMessages);
          setConversation(data.conversation || { 
            id: data.conversation_id,
            jobTitle: jobTitle || 'Chat Conversation'
          });
        } else {
          console.error('Failed to fetch messages:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    }
    request();
  }, [conversationId, authToken, jobTitle])

  useEffect(() => {
    const fetchConversation = async () => {
      if (!jobId || !currentUserId) return;
      
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/travel/chat-component/create-chat`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_id: jobId,
            trader_id: currentUserId,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data?.conversation?.conversation_id) {
            setConversationId(data.conversation.conversation_id);
            setConversation(data.conversation);
          }
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };
    
    fetchConversation();
  }, [jobId, currentUserId]);

  // Create counterparty object for display using URL parameters
  // Always create counterparty if we have URL parameters, even without conversation
  const counterparty = (homeownerName || traderName || conversationId) ? {
    id: 'other-user',
    name: homeownerName || traderName || 'Chat Partner',
    role: 'homeowner' as const,
    avatarUrl: null
  } : null;

  // Debug logging
  console.log('Chat Debug:', {
    conversationId,
    conversation,
    counterparty,
    homeownerName,
    traderName,
    jobTitle,
    messagesLength: messages.length,
    isLoadingMessages
  });

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) {
      console.log('Cannot send message:', { message: message.trim(), conversationId });
      return;
    }
    
    // Use conversationId directly instead of trying to modify it
    const chatObj = {
      conversationId: conversationId,
      body: message.trim(),
      action: "send_message"
    };

    console.log('Sending message:', chatObj);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/travel/chat-component`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(chatObj)
      });
      
      console.log('Send message response:', response.status, response.statusText);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Message sent successfully:', responseData);
        setMessage(''); // Clear the input after sending
        
        // Refresh messages after sending
        const refreshUrl = `${apiUrl}/travel/chat-component/${conversationId}`;
        const refreshResponse = await fetch(refreshUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log('Refreshed messages:', refreshData);
          const transformedMessages = refreshData.messages?.map(msg => ({
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            body: msg.body,
            createdAt: new Date(msg.created_at).getTime(),
            attachments: msg.attachments_json ? JSON.parse(msg.attachments_json) : []
          })) || [];
          setMessages(transformedMessages);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send message:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1320px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              {/* Mobile Conversations Button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="sm:hidden flex-shrink-0 min-h-[44px] px-4 text-sm font-semibold shadow-sm"
                aria-label="Open conversations"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversations
              </Button>
              
              <h1 className="font-semibold text-lg">Chat</h1>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-4rem)] relative">
          {/* Desktop Sidebar */}
          <div className="hidden sm:block w-[340px] flex-shrink-0">
            <Sidebar
              conversation={conversation}
              counterparty={counterparty}
              currentUserId={currentUserId}
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
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Messages Area */}
          {isLoadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              conversation={conversation}
              currentUserId={currentUserId}
              counterparty={counterparty}
            />
          )}

          {/* Message Input */}
          <div className="border-t border-border p-4">
            <div  className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;