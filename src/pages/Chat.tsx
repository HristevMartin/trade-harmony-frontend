import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, MessageCircle, CheckCircle, DollarSign, Clock, Briefcase, User } from 'lucide-react';
import MessageList from '@/components/chat/MessageList';
import Sidebar from '@/components/chat/Sidebar';
import { useChats, type Counterparty } from '@/components/chat/useChatStore';
import FollowUpQuestions from '@/components/FollowUpQuestions';
import { useAiJobFit } from '@/hooks/useAiJobFit';
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
  const jobBudget = searchParams.get('budget');
  const jobUrgency = searchParams.get('urgency');
  const jobCategory = searchParams.get('category');
  
  // Check if this is coming from payment flow
  const isPaymentFlow = !conversationId && jobId && homeownerName;

  // Get AI job fit data for follow-up questions (if we have a jobId)
  const { followUpQuestions } = useAiJobFit(jobId || '');
  
  // Helper functions for job data formatting
  const formatBudget = (budget: string | null) => {
    if (!budget) return null;
    const budgetMap: { [key: string]: string } = {
      'under-200': 'Under £200',
      '200-500': '£200 - £500',
      '500-1000': '£500 - £1,000',
      'over-1000': 'Over £1,000',
      'flexible': 'Flexible'
    };
    return budgetMap[budget] || budget;
  };

  const formatUrgency = (urgency: string | null) => {
    if (!urgency) return null;
    return urgency;
  };

  // Debug logging
  console.log('Chat Component Debug:', {
    paramConversationId,
    searchParamsConversationId: searchParams.get('conversation_id'),
    finalConversationId: conversationId,
    isPaymentFlow,
    paymentFlowParams: { jobId, homeownerName, traderName, jobTitle, jobBudget, jobUrgency, jobCategory },
    messageParam: searchParams.get('message'),
    currentUrl: window.location.href
  });
  
  const [message, setMessage] = useState(searchParams.get('message') || '');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { chats, fetchChats } = useChats();

  // Session-based authentication instead of token
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log('Checking authentication status');
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/travel/auth/session`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        console.log('Authentication response:', data);
        
        setIsAuthenticated(data.authenticated);
        // For backward compatibility, set a dummy token when authenticated
        setAuthToken(data.authenticated ? 'session-authenticated' : null);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setAuthToken(null);
      }
    };
    
    checkAuthentication();
  }, []);
  
  

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
  
  // Check if current user is a homeowner/customer
  const isCustomer = Array.isArray(authUser?.role) 
    ? authUser.role.includes('customer') || authUser.role.includes('CUSTOMER') || authUser.role.includes('homeowner') || authUser.role.includes('HOMEOWNER')
    : authUser?.role === 'customer' || authUser?.role === 'CUSTOMER' || authUser?.role === 'homeowner' || authUser?.role === 'HOMEOWNER';
  
  // Debug authentication state
  console.log('Chat Auth Debug:', {
    authUser,
    currentUserId,
    isAuthenticated,
    authToken: !!authToken,
    conversationId
  });
  
  

  // Function to mark conversation as read
  const markConversationAsRead = async (conversationId: string, authToken: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const readResponse = await fetch(`${apiUrl}/travel/chat-component/mark-as-read/${conversationId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
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
  }, [authToken]); // fetchChats is now stable

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
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
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
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
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
  }, [conversationId, authToken, isPaymentFlow, jobId, currentUserId, navigate, isAuthenticated]);

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

  // Handle pre-filled message from URL search parameters
  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam && messageParam !== message) {
      console.log('Setting message from URL parameter:', messageParam);
      setMessage(messageParam);
      
      // Clear the message parameter from the URL after setting it to state
      // to avoid re-triggering this effect
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('message');
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

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

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend || !conversationId) {
      console.log('Cannot send message:', { message: textToSend, conversationId });
      return;
    }
    
    // Use conversationId directly instead of trying to modify it
    const chatObj = {
      conversationId: conversationId,
      senderId: currentUserId, // Add sender ID to identify who is sending
      body: textToSend,
      action: "send_message"
    };

    console.log('Sending message:', chatObj);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/travel/chat-component/${conversationId}`;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatObj)
      });
      
      console.log('Send message response:', response.status, response.statusText);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Message sent successfully:', responseData);
        // Only clear message if it was user typed (not from follow-up question)
        if (!messageText) {
          setMessage(''); // Clear the input after sending
        }
        
        // Refresh messages after sending
        const refreshUrl = `${apiUrl}/travel/chat-component/${conversationId}`;
        const refreshResponse = await fetch(refreshUrl, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header - Final refined design pass */}
      <header className="flex-shrink-0 bg-background">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
          {/* Left side - Back button */}
          <div className="flex items-center flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-muted -ml-2 min-h-[44px] min-w-[44px]"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          
          {/* Center - Profile Capsule (only clickable for customers) */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            {counterparty && isCustomer ? (
              <>
                {/* Profile Capsule - Extra padding for centering */}
                <div className="py-1.5">
                  <button
                    onClick={(e) => {
                      // Premium micro-interaction
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.opacity = '0.85';
                      setTimeout(() => {
                        navigate(`/tradesperson/profile/${counterparty.id}`);
                      }, 170);
                    }}
                    className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 group hover:bg-[#F0F7FF] rounded-lg px-3 sm:px-4 py-3 sm:py-2.5 transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] w-full sm:w-auto"
                    aria-label="View tradesperson profile"
                  >
                    {/* Avatar - 32px circle with light gray border */}
                    {counterparty.avatar_url ? (
                      <img
                        src={counterparty.avatar_url}
                        alt={counterparty.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#E5E7EB] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border-2 border-[#E5E7EB] flex-shrink-0">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                    
                    {/* Name, Arrow, and Profession - Aligned */}
                    <div className="flex flex-col items-center sm:items-start min-w-0 gap-0.5">
                      <div className="flex items-baseline gap-1">
                        <h1 className="font-bold text-base text-gray-800 group-hover:text-blue-600 transition-colors duration-200 ease-in-out truncate">
                          {counterparty.name}
                        </h1>
                        <svg
                          className="w-2.5 h-2.5 text-gray-500 group-hover:text-blue-600 transition-colors duration-200 ease-in-out flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ marginLeft: '4px' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      
                      {/* Profession - consistent 16px line height */}
                      {counterparty.job_title && (
                        <span className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[260px]" style={{ lineHeight: '16px' }}>
                          {counterparty.job_title}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
                
                {/* Hint text - improved spacing and readability */}
                <p className="text-sm text-gray-600 italic mt-1 mb-2 text-center px-4 max-w-[80%] mx-auto leading-relaxed">
                  💡 You can click the trader's name above to view their profile
                </p>
              </>
            ) : counterparty ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-2 py-3">
                {/* Non-clickable version for traders */}
                {counterparty.avatar_url ? (
                  <img
                    src={counterparty.avatar_url}
                    alt={counterparty.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#E5E7EB]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border-2 border-[#E5E7EB]">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                <div className="flex flex-col items-center sm:items-start gap-0.5">
                  <h1 className="font-bold text-base text-gray-800 truncate">
                    {counterparty.name}
                  </h1>
                  {counterparty.job_title && (
                    <span className="text-sm text-gray-500 truncate" style={{ lineHeight: '16px' }}>
                      {counterparty.job_title}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <h1 className="font-semibold text-base sm:text-lg text-foreground truncate py-3">
                {isPaymentFlow ? homeownerName : 'Chat'}
              </h1>
            )}
          </div>
          
          {/* Right side - Mobile Conversations Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="sm:hidden flex-shrink-0 min-h-[44px] min-w-[44px] px-3 text-xs font-medium shadow-sm"
              aria-label="Open conversations"
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              Chats
            </Button>
          </div>
        </div>
        
        {/* Hairline divider - separated and light */}
        <div className="pt-2">
          <div className="h-px bg-[#E5E7EB]"></div>
        </div>
      </header>

      {/* Job Info Header - Shows job context when available */}
      {(isPaymentFlow || (conversationId && (jobBudget || jobUrgency || jobCategory || counterparty?.job_title))) && (
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* Job Title */}
              {(jobTitle || counterparty?.job_title) && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {jobTitle || counterparty?.job_title}
                  </span>
                </div>
              )}
              
              {/* Budget */}
              {(jobBudget || formatBudget(jobBudget)) && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {formatBudget(jobBudget)}
                </Badge>
              )}
              
              {/* Urgency */}
              {(jobUrgency || formatUrgency(jobUrgency)) && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatUrgency(jobUrgency)}
                </Badge>
              )}
              
              {/* Category */}
              {jobCategory && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                  {jobCategory}
                </Badge>
              )}
              
              {/* Job ID for reference */}
              {jobId && (
                <span className="text-blue-600 text-xs font-mono">
                  Job #{jobId}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Flex container for sidebar and chat */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0 border-r border-border">
          <Sidebar
            conversation={conversation}
            counterparty={legacyCounterparty}
            authToken={authToken}
            currentConversationId={conversationId}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent 
            side="left" 
            className="w-[85vw] max-w-sm p-0 border-r"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <Sidebar
              conversation={conversation} 
              counterparty={legacyCounterparty}
              authToken={authToken}
              currentConversationId={conversationId}
              onClose={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Chat Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Messages Container - Takes all available space minus input */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {!conversationId && !isPaymentFlow ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground mb-3">Select a conversation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose a conversation from the sidebar to start chatting with your contacts.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSidebarOpen(true)}
                    className="mt-6 lg:hidden"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Browse Conversations
                  </Button>
                </div>
              </div>
            ) : isLoadingMessages ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  {/* Enhanced Welcome State for Payment Flow */}
                  {isPaymentFlow ? (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-xl text-foreground mb-3">
                        You've successfully applied for this job! 🎉
                      </h3>
                      <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                        Start the conversation below to discuss the project details with {homeownerName}.
                      </p>
                      <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 mb-4">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Ready to chat about: {jobTitle || `Job #${jobId}`}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="w-12 h-12 text-primary/60" />
                      </div>
                      <h3 className="font-semibold text-xl text-foreground mb-3">No messages yet</h3>
                      <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                        {counterparty?.name 
                          ? `Start a conversation with ${counterparty.name}. Send a message below to get started.`
                          : 'Send a message below to start the conversation.'
                        }
                      </p>
                      {counterparty?.job_title && (
                        <div className="inline-flex items-center px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm text-primary mb-4">
                          About: {counterparty.job_title}
                        </div>
                      )}
                    </>
                  )}
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

          {/* Follow-up Questions - Only in active conversations with jobId */}
          {conversationId && jobId && followUpQuestions.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50">
              <div className="p-3 sm:p-4">
                <FollowUpQuestions
                  questions={followUpQuestions}
                  mode="postpay"
                  onQuestionClick={(question) => handleSendMessage(question)}
                />
              </div>
            </div>
          )}

          {/* Message Input - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg">
            <div className="p-3 sm:p-4">
              <div className="flex gap-3 max-w-4xl mx-auto bg-muted/30 rounded-2xl p-3 shadow-sm border border-border/50">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && conversationId) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={conversationId ? "Type your message..." : "Select a conversation to start chatting"}
                  disabled={!conversationId}
                  className="flex-1 px-4 py-3 bg-background rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-sm transition-all min-h-[44px]"
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || !conversationId}
                  className="rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                  size="icon"
                >
                  <Send className="w-5 h-5" />
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
