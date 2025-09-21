import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import MessageList from '@/components/chat/MessageList';
import Sidebar from '@/components/chat/Sidebar';
import { useChats, type Counterparty } from '@/components/chat/useChatStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const Chat = () => {
  const navigate = useNavigate();
  const { conversation_id: paramConversationId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Support both URL params and search params for backward compatibility
  const conversationId = paramConversationId || searchParams.get('conversation_id');
  
  // Payment flow parameters
  const jobId = searchParams.get('job_id');
  const homeownerName = searchParams.get('homeowner_name');
  const traderName = searchParams.get('trader_name');
  const jobTitle = searchParams.get('job_title');
  
  // Check if this is coming from payment flow
  const isPaymentFlow = !conversationId && jobId && homeownerName;
  
  // Debug logging
  console.log('Chat Component Debug:', {
    paramConversationId,
    searchParamsConversationId: searchParams.get('conversation_id'),
    finalConversationId: conversationId,
    isPaymentFlow,
    paymentFlowParams: { jobId, homeownerName, traderName, jobTitle },
    currentUrl: window.location.href
  });
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { chats, fetchChats } = useChats();
  
  // const [userInfo, setUserInfo] = useState(() => {
  //   const authUser = localStorage.getItem('auth_user')
  //   if (authUser) {
  //     const userData = JSON.parse(authUser);
  //     return userData;
  //   }
  //   return null;
  // })

  // parse sideBarOpen query param and auto-select latest conversation
  const sideBarOpen = searchParams.get('sideBarOpen');
  useEffect(() => {
    if (sideBarOpen && !conversationId) {
      // On mobile, open the sidebar sheet
      setSidebarOpen(true);
      
      if (chats.length > 0) {
        // Find the most recent conversation and navigate to it
        const latestConversation = chats
          .slice()
          .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())[0];
        
        if (latestConversation?.conversation_id) {
          // Navigate to the latest conversation, removing the sideBarOpen param
          navigate(`/chat/${latestConversation.conversation_id}`, { replace: true });
        }
      }
      // If no chats, just keep the sidebar open to show "No conversations yet"
    }
  }, [sideBarOpen, chats, conversationId, navigate])
  
  // Get current user from localStorage
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const currentUserId = authUser.id;
  const authToken = localStorage.getItem('access_token');

  // Function to mark conversation as read
  const markConversationAsRead = async (conversationId: string, authToken: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const readResponse = await fetch(`${apiUrl}/travel/chat-component/mark-as-read/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (readResponse.ok) {
        console.log('Marked conversation as read:', conversationId);
        
        // Find the current chat to get its unread count
        const currentChat = chats.find(chat => chat.conversation_id === conversationId);
        const unreadCount = currentChat?.unread_count || 0;
        
        // Optimistically update navbar unread count
        if (unreadCount > 0 && (window as any).updateNavbarUnreadCount) {
          (window as any).updateNavbarUnreadCount(-unreadCount);
        }
        
        // Trigger a refetch of chats to get updated data
        if (authToken) {
          fetchChats(authToken);
        }
      } else {
        console.warn('Failed to mark conversation as read:', readResponse.status);
      }
    } catch (readError) {
      console.error('Error marking conversation as read:', readError);
    }
  };


  // Find current chat from the chats list to get counterparty info
  const currentChat = chats.find(chat => chat.conversation_id === conversationId);

  // Handle payment flow - create counterparty from URL parameters
  useEffect(() => {
    if (isPaymentFlow && homeownerName) {
      console.log('Setting counterparty from payment flow parameters');
      const paymentFlowCounterparty: Counterparty = {
        id: 'homeowner_' + jobId, // Generate a temporary ID
        name: homeownerName,
        job_title: jobTitle || `Job #${jobId}`
      };
      setCounterparty(paymentFlowCounterparty);
    }
  }, [isPaymentFlow, homeownerName, jobId, jobTitle]);

  // Set counterparty from current chat data (only if not already set from conversation API)
  useEffect(() => {
    // Only set from chat list if we don't have counterparty data yet
    if (!counterparty) {
      if (currentChat) {
        console.log('Setting counterparty from currentChat:', currentChat);
        setCounterparty(currentChat.counterparty);
      } else if (chats.length > 0 && conversationId) {
        console.log('Looking for conversation in chats:', { conversationId, chats });
        const foundChat = chats.find(chat => chat.conversation_id === conversationId);
        if (foundChat) {
          console.log('Found chat, setting counterparty:', foundChat);
          setCounterparty(foundChat.counterparty);
        }
      }
    }
  }, [currentChat, chats, conversationId, counterparty]);

  // Fetch all chats when component mounts
  useEffect(() => {
    if (authToken) {
      fetchChats(authToken);
    }
  }, [authToken]);

  // Handle payment flow - find existing conversation for this job
  useEffect(() => {
    if (isPaymentFlow && chats.length > 0 && jobId && authToken) {
      console.log('Payment flow: Looking for existing conversation for job:', jobId);
      
      // Look for existing conversation with this job_id
      const existingChat = chats.find(chat => chat.job_id === jobId);
      
      if (existingChat) {
        console.log('Found existing conversation for job:', existingChat);
        // Redirect to the existing conversation
        const newUrl = `/chat/${existingChat.conversation_id}`;
        console.log('Redirecting to existing conversation:', newUrl);
        navigate(newUrl, { replace: true });
      } else {
        console.log('No existing conversation found for job:', jobId);
        // We'll handle conversation creation in the message fetch effect
      }
    }
  }, [isPaymentFlow, chats, jobId, authToken, navigate]);

  // Reset messages and counterparty when conversation changes
  useEffect(() => {
    setMessages([]);
    setConversation(null);
    setCounterparty(null);
    setIsLoadingMessages(true);
  }, [conversationId]);

  // Fetch messages for the current conversation
  useEffect(() => {
    const fetchMessages = async () => {
      // Handle payment flow - create conversation if needed
      if (isPaymentFlow && !conversationId && jobId && authToken) {
        console.log('Payment flow: Creating new conversation for job:', jobId);
        setIsLoadingMessages(true);
        
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const createResponse = await fetch(`${apiUrl}/travel/chat-component/create-chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              job_id: jobId,
              trader_id: currentUserId,
            }),
          });
          
          if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('Created conversation:', createData);
            const newConversationId = createData.conversation?.conversation_id;
            
            if (newConversationId) {
              // Redirect to the new conversation
              const newUrl = `/chat/${newConversationId}`;
              console.log('Redirecting to new conversation:', newUrl);
              navigate(newUrl, { replace: true });
              return;
            }
          } else {
            console.error('Failed to create conversation:', createResponse.status);
          }
        } catch (error) {
          console.error('Error creating conversation:', error);
        } finally {
          setIsLoadingMessages(false);
        }
        return;
      }
      
      if (!conversationId || !authToken) {
        console.log('No conversationId or authToken, skipping message fetch', { conversationId, authToken: !!authToken });
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
          console.log('Messages API response for conversation', conversationId, ':', data);
          
          const transformedMessages = data.messages?.map(msg => ({
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            body: msg.body,
            createdAt: new Date(msg.created_at).getTime(),
            attachments: msg.attachments_json ? JSON.parse(msg.attachments_json) : []
          })).sort((a, b) => a.createdAt - b.createdAt) || []; // Sort in ascending order
          
          console.log('Loaded', transformedMessages.length, 'messages for conversation:', conversationId);
          
          setMessages(transformedMessages);
          
          // Store conversation data if available
          if (data.conversation) {
            console.log('Setting conversation data:', data.conversation);
            setConversation(data.conversation);
            
            // Update counterparty from conversation data if available and more complete
            if (data.conversation.counterparty) {
              console.log('Updating counterparty from conversation data:', data.conversation.counterparty);
              setCounterparty(data.conversation.counterparty);
            }
          }

          // Mark conversation as read after messages are loaded
          markConversationAsRead(conversationId, authToken);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch messages:', {
            status: response.status,
            statusText: response.statusText,
            conversationId,
            url,
            errorText
          });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [conversationId, authToken, isPaymentFlow, jobId, currentUserId, navigate]);

  // Mark conversation as read when window gains focus
  useEffect(() => {
    const handleWindowFocus = () => {
      if (conversationId && authToken) {
        markConversationAsRead(conversationId, authToken);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [conversationId, authToken]);

  // Create a UserRef-compatible counterparty for legacy components with defensive checks
  const legacyCounterparty = counterparty ? {
    id: counterparty.id || '',
    name: counterparty.name || 'Unknown',
    avatarUrl: counterparty.avatar_url || undefined,
    role: 'homeowner' as const // Default role since we don't have this in new API
  } : null;

  // Debug logging
  console.log('Chat Debug:', {
    conversationId,
    conversation,
    counterparty,
    currentChat,
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
      senderId: currentUserId, // Add sender ID to identify who is sending
      body: message.trim(),
      action: "send_message"
    };

    console.log('Sending message:', chatObj);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/travel/chat-component/${conversationId}`;
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
          })).sort((a, b) => a.createdAt - b.createdAt) || []; // Sort in ascending order
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
    <div className="h-dvh bg-background overflow-hidden">
      <div className="max-w-[1320px] mx-auto h-full flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 bg-background border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left side - Back button */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Center - Title */}
            <div className="flex-1 flex justify-center">
              <h1 className="font-semibold text-lg">
                {counterparty?.name || (isPaymentFlow ? homeownerName : 'Chat')}
              </h1>
            </div>
            
            {/* Right side - Mobile Conversations Button */}
            <div className="flex items-center">
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
            </div>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden sm:block w-[340px] flex-shrink-0">
            <Sidebar
              conversation={conversation}
              counterparty={legacyCounterparty}
              authToken={authToken}
              currentConversationId={conversationId}
            />
          </div>

          {/* Mobile Sidebar Drawer - Only show on small screens */}
          <div className="sm:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetContent 
                side="left" 
                className="w-[96vw] min-w-0 max-w-[420px] p-0 backdrop-blur-sm"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="relative bg-background h-full">
                  <Sidebar
                    conversation={conversation} 
                    counterparty={legacyCounterparty}
                    authToken={authToken}
                    currentConversationId={conversationId}
                    onClose={() => setSidebarOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
            {/* Messages Area - Fixed height calculation */}
            <div className="flex-1 overflow-hidden min-h-0" style={{ maxHeight: 'calc(100dvh - 64px - 100px)' }}>
              {!conversationId && !isPaymentFlow ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a conversation from the sidebar to start chatting</p>
                  </div>
                </div>
              ) : isLoadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-primary/60" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">No messages yet</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {counterparty?.name 
                        ? `Say hello to start the conversation with ${counterparty.name}.`
                        : 'Say hello to start the conversation with your contact.'
                      }
                    </p>
                    {counterparty?.job_title && (
                      <p className="text-xs text-muted-foreground mb-4">
                        About: {counterparty.job_title}
                      </p>
                    )}
                    <div className="inline-flex items-center px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm text-primary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ready to chat
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <MessageList
                    messages={messages}
                    conversation={conversation}
                    currentUserId={currentUserId}
                    counterparty={legacyCounterparty}
                  />
                </div>
              )}
            </div>

            {/* Message Input - Always visible at bottom */}
            <div className="flex-shrink-0 border-t border-border p-4 bg-background">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && conversationId && handleSendMessage()}
                  placeholder={conversationId ? "Type your message..." : "Select a conversation to start chatting"}
                  disabled={!conversationId}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted/50 disabled:text-muted-foreground disabled:cursor-not-allowed"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !conversationId}
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