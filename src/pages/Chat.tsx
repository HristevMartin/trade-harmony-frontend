import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, MessageCircle, CheckCircle, DollarSign, Clock, Briefcase, User, Phone } from 'lucide-react';
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

  // Support both URL psarams and search params for backward compatibility
  const conversationId = paramConversationId || searchParams.get('conversation_id');

  // Payment flow parameters
  const jobId = searchParams.get('job_id');
  const homeownerName = searchParams.get('homeowner_name');
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


  const [message, setMessage] = useState(searchParams.get('message') || '');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [isCounterpartyLoading, setIsCounterpartyLoading] = useState(true);
  const [traderId, setTraderId] = useState<string | null>(null);
  const [traderProfileSlug, setTraderProfileSlug] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { chats, fetchChats } = useChats();

  // Session-based authentication instead of token
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Refs for dynamic height calculation
  const headerRef = useRef<HTMLElement>(null);
  const jobInfoRef = useRef<HTMLDivElement>(null);

  // Update CSS variable for header height
  const updateHeaderHeight = useCallback(() => {
    const headerHeight = (headerRef.current?.offsetHeight || 0) + (jobInfoRef.current?.offsetHeight || 0);
    document.documentElement.style.setProperty('--header-h', `${headerHeight}px`);
  }, []);

  // Update header height on mount, resize, and when job info changes
  useEffect(() => {
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [updateHeaderHeight]);

  // Update when job info visibility changes
  useEffect(() => {
    updateHeaderHeight();
  }, [conversationId, isLoadingMessages, messages.length, conversation, counterparty, jobTitle, jobBudget, jobUrgency, jobCategory, updateHeaderHeight]);

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


  useEffect(() => {
    const apiFetchRequest = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/travel/past-jobs`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Chat summary data:', data);
        } else {
          console.error('Failed to fetch chat summary:', response.status);
        }
      } catch (error) {
        console.error('Error fetching chat summary:', error);
      }
    };

    apiFetchRequest();
  }, []);



  // Get current user from localStorage
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const currentUserId = authUser.id;

  // Check if current user is a homeowner/customer
  const isCustomer = Array.isArray(authUser?.role)
    ? authUser.role.includes('customer') || authUser.role.includes('CUSTOMER') || authUser.role.includes('homeowner') || authUser.role.includes('HOMEOWNER')
    : authUser?.role === 'customer' || authUser?.role === 'CUSTOMER' || authUser?.role === 'homeowner' || authUser?.role === 'HOMEOWNER';


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

  useEffect(() => {
    if (currentChat && isCustomer) {
      if (currentChat.counterparty?.id) {
        setTraderId(currentChat.counterparty.id);
      }
    }
  }, [currentChat, isCustomer]);

  useEffect(() => {
    const fetchTraderId = async () => {
      if (!conversationId || !isCustomer || traderId) return; 

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/travel/chat-component/chat-summary`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Chat summary data for trader ID:', data);

          // Find the conversation that matches our current conversationId
          const conversation = data.conversations?.find((conv: any) =>
            conv.conversation_id === conversationId
          );

          if (conversation?.trader_id) {
            console.log('Found trader ID from chat summary:', conversation.trader_id);
            setTraderId(conversation.trader_id);
          }
        }
      } catch (error) {
        console.error('Error fetching trader ID from chat summary:', error);
      }
    };

    fetchTraderId();
  }, [conversationId, isCustomer, traderId]);

  const updateCounterparty = useCallback((value: Counterparty | null) => {
    setCounterparty(value);
    setIsCounterpartyLoading(!value);
    if (!value) {
      setTraderProfileSlug(null);
    }
  }, []);

  // Automatically derive or fetch a profile slug for navigation when viewing as a homeowner
  useEffect(() => {
    if (!isCustomer || !counterparty) {
      return;
    }

    // Prefer values embedded in the counterparty payload
    const embeddedSlugCandidates: Array<unknown> = [
      (counterparty as Record<string, unknown> | null)?.profileNameId,
      (counterparty as Record<string, unknown> | null)?.profile_name_id,
      (counterparty as Record<string, unknown> | null)?.nameId,
      (counterparty as Record<string, unknown> | null)?.name_id,
      (counterparty as Record<string, unknown> | null)?.profileSlug,
      (counterparty as Record<string, unknown> | null)?.profile_slug,
      (counterparty as Record<string, unknown> | null)?.slug
    ];

    const embeddedSlug = embeddedSlugCandidates.find(
      value => typeof value === 'string' && value.trim().length > 0
    ) as string | undefined;

    if (embeddedSlug) {
      setTraderProfileSlug(embeddedSlug.trim());
      return;
    }

    if (!counterparty.id || String(counterparty.id).startsWith('homeowner_')) {
      return;
    }

    const controller = new AbortController();

    const fetchProfileSlug = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/travel/get-trader-project/${counterparty.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        if (!response.ok) {
          console.warn('Failed to fetch trader profile details for slug resolution', response.status);
          return;
        }

        const data = await response.json();
        const slugCandidates: Array<unknown> = [
          data?.project?.nameId,
          data?.project?.profileNameId,
          data?.project?.profileSlug,
          data?.project?.slug,
          data?.project?.name_id,
          data?.trader?.nameId,
          data?.trader?.profileNameId,
          data?.trader?.profileSlug,
          data?.trader?.slug
        ];

        const slug = slugCandidates.find(
          value => typeof value === 'string' && value.trim().length > 0
        ) as string | undefined;

        if (slug) {
          setTraderProfileSlug(slug.trim());
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error resolving trader profile slug:', error);
        }
      }
    };

    fetchProfileSlug();

    return () => controller.abort();
  }, [isCustomer, counterparty]);

  // Handle payment flow - create counterparty from URL parameters
  useEffect(() => {
    if (isPaymentFlow && homeownerName) {
      console.log('Setting counterparty from payment flow parameters');
      const paymentFlowCounterparty: Counterparty = {
        id: 'homeowner_' + jobId, // Generate a temporary ID
        name: homeownerName,
        job_title: jobTitle || `Job #${jobId}`,
        project_id: jobId
      };
      updateCounterparty(paymentFlowCounterparty);
    }
  }, [isPaymentFlow, homeownerName, jobId, jobTitle, updateCounterparty]);

  // Set counterparty from current chat data (only if not already set from conversation API)
  useEffect(() => {
    // Only set from chat list if we don't have counterparty data yet
    if (!counterparty) {
      if (currentChat) {
        console.log('Setting counterparty from currentChat:', currentChat);
        updateCounterparty(currentChat.counterparty);
      } else if (chats.length > 0 && conversationId) {
        console.log('Looking for conversation in chats:', { conversationId, chats });
        const foundChat = chats.find(chat => chat.conversation_id === conversationId);
        if (foundChat) {
          console.log('Found chat, setting counterparty:', foundChat);
          updateCounterparty(foundChat.counterparty);
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
    updateCounterparty(null);
    setTraderId(null);
    setIsLoadingMessages(true);
    if (!conversationId) {
      setIsCounterpartyLoading(false);
    }
  }, [conversationId, updateCounterparty]);

  // Polling interval for fetching new messages
  useEffect(() => {
    if (!conversationId || !authToken) return;

    const pollMessages = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const url = `${apiUrl}/travel/chat-component/${conversationId}`;
        
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const transformedMessages = data.messages?.map(msg => ({
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            body: msg.body,
            createdAt: new Date(msg.created_at).getTime(),
            attachments: msg.attachments_json ? JSON.parse(msg.attachments_json) : []
          })).sort((a, b) => a.createdAt - b.createdAt) || [];

          // Only update if messages actually changed (check by comparing IDs)
          setMessages(prev => {
            const prevIds = prev.map(m => m.id).sort().join(',');
            const newIds = transformedMessages.map(m => m.id).sort().join(',');
            
            if (prevIds !== newIds) {
              console.log('🔄 [POLLING] New messages detected!', {
                oldCount: prev.length,
                newCount: transformedMessages.length,
                oldIds: prev.map(m => m.id),
                newIds: transformedMessages.map(m => m.id),
                currentUserId,
                userRole: isCustomer ? 'HOMEOWNER' : 'TRADER'
              });
              return transformedMessages;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(pollMessages, 3000);
    
    return () => clearInterval(interval);
  }, [conversationId, authToken]);

  // Fetch messages for the current conversation
  useEffect(() => {
    const fetchMessages = async () => {
      // Handle payment flow - create conversation if needed
      if (isPaymentFlow && !conversationId && jobId && authToken) {
        console.log('Payment flow: Creating new conversation for job:', jobId);
        setIsLoadingMessages(true);

        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          
          // First, fetch the job data to get the homeowner_id
          let homeownerId: string | undefined;
          try {
            const jobResponse = await fetch(`${apiUrl}/travel/get-client-project/${jobId}`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            if (jobResponse.ok) {
              const jobData = await jobResponse.json();
              homeownerId = jobData.project?.user_id;
              console.log('Fetched homeowner_id from job:', homeownerId);
            }
          } catch (error) {
            console.warn('Could not fetch job data for homeowner_id:', error);
          }
          
          const createResponse = await fetch(`${apiUrl}/travel/chat-component/create-chat`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              job_id: jobId,
              trader_id: currentUserId,
              homeowner_id: homeownerId,
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
          console.log('📨 Messages API response for conversation', conversationId, ':', data);
          console.log('📨 Raw messages array:', data.messages);
          console.log('📨 Number of messages:', data.messages?.length || 0);

          const transformedMessages = data.messages?.map(msg => {
            const transformed = {
              id: msg.id,
              conversationId: msg.conversation_id,
              senderId: msg.sender_id,
              body: msg.body,
              createdAt: new Date(msg.created_at).getTime(),
              attachments: msg.attachments_json ? JSON.parse(msg.attachments_json) : []
            };
            console.log('📝 Transformed message:', {
              id: transformed.id,
              senderId: transformed.senderId,
              body: transformed.body.substring(0, 50) + '...',
              createdAt: new Date(transformed.createdAt).toISOString()
            });
            return transformed;
          }).sort((a, b) => a.createdAt - b.createdAt) || []; // Sort in ascending order

          console.log('✅ Loaded', transformedMessages.length, 'messages for conversation:', conversationId);
          console.log('👤 Current user ID:', currentUserId);
          console.log('📊 Message sender IDs:', transformedMessages.map(m => m.senderId));
          
          // Check if any messages are from the current user
          const myMessages = transformedMessages.filter(m => m.senderId === currentUserId);
          const otherMessages = transformedMessages.filter(m => m.senderId !== currentUserId);
          console.log('📊 Message breakdown:', {
            total: transformedMessages.length,
            myMessages: myMessages.length,
            otherMessages: otherMessages.length
          });

          setMessages(transformedMessages);
          
          console.log('✅ State updated - messages array length:', transformedMessages.length);
          console.log('✅ Messages state after setMessages:', transformedMessages.map(m => ({
            id: m.id,
            senderId: m.senderId,
            body: m.body.substring(0, 30) + '...'
          })));
          
          // Log rendering info
          console.log('🎨 Will render MessageList with:', {
            messagesCount: transformedMessages.length,
            conversationId,
            currentUserId,
            sampleMessages: transformedMessages.slice(0, 3).map(m => ({
              id: m.id,
              senderId: m.senderId,
              body: m.body.substring(0, 30)
            }))
          });

          // Store conversation data if available
          if (data.conversation) {
            console.log('Setting conversation data:', data.conversation);
            setConversation(data.conversation);

            // Update counterparty from conversation data if available and more complete
            if (data.conversation.counterparty) {
              console.log('Updating counterparty from conversation data:', data.conversation.counterparty);
            updateCounterparty(data.conversation.counterparty);
          } else {
            setIsCounterpartyLoading(false);
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
  }, [conversationId, authToken, isPaymentFlow, jobId, currentUserId, navigate, isAuthenticated, updateCounterparty]);

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

  const resolvedCounterpartyPhone = useMemo(() => {
    if (!counterparty) {
      return '';
    }

    const candidates = [
      counterparty.phone,
      (counterparty as Record<string, unknown>).phoneNumber,
      counterparty.phone_number,
      (counterparty as Record<string, unknown>).phone_number,
      counterparty.contact_number,
      (counterparty as Record<string, unknown>).contactNumber
    ];

    const found = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
    if (typeof found === 'string') {
      return found.trim();
    }

    if (typeof counterparty.phone === 'number') {
      return String(counterparty.phone);
    }

    return '';
  }, [counterparty]);

  const resolvedCounterpartyPhoneHref = useMemo(() => {
    if (!resolvedCounterpartyPhone) {
      return '';
    }
    const digitsOnly = resolvedCounterpartyPhone.replace(/[^\d+]/g, '');
    return digitsOnly ? `tel:${digitsOnly}` : '';
  }, [resolvedCounterpartyPhone]);

  const profileIdentifierCandidates = useMemo(() => {
    const base: Array<unknown> = [
      traderProfileSlug,
      traderId,
      (counterparty as Record<string, unknown> | null)?.profileNameId,
      (counterparty as Record<string, unknown> | null)?.profile_name_id,
      (counterparty as Record<string, unknown> | null)?.nameId,
      (counterparty as Record<string, unknown> | null)?.name_id,
      (counterparty as Record<string, unknown> | null)?.profileSlug,
      (counterparty as Record<string, unknown> | null)?.profile_slug,
      (counterparty as Record<string, unknown> | null)?.slug,
      (conversation as Record<string, unknown> | null)?.traderProfile &&
        typeof (conversation as Record<string, unknown> | null)?.traderProfile === 'object'
        ? ((conversation as Record<string, unknown>).traderProfile as Record<string, unknown>).nameId
        : undefined,
      (conversation as Record<string, unknown> | null)?.trader_profile &&
        typeof (conversation as Record<string, unknown> | null)?.trader_profile === 'object'
        ? ((conversation as Record<string, unknown>).trader_profile as Record<string, unknown>).nameId
        : undefined,
      (conversation as Record<string, unknown> | null)?.trader_name_id,
      counterparty?.id
    ];

    return base
      .map(value => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length > 0 ? trimmed : null;
        }
        if (typeof value === 'number') {
          return String(value);
        }
        return null;
      })
      .filter((value): value is string => Boolean(value));
  }, [traderProfileSlug, traderId, counterparty, conversation]);

  // Create a UserRef-compatible counterparty for legacy components with defensive checks
  const legacyCounterparty = counterparty ? {
    id: counterparty.id || '',
    name: counterparty.name || 'Unknown',
    avatarUrl: counterparty.avatar_url || undefined,
    role: 'homeowner' as const // Default role since we don't have this in new API
  } : null;


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

      console.log('📤 [SEND MESSAGE] Response:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ [SEND MESSAGE] Success! Backend response:', responseData);
        console.log('✅ [SEND MESSAGE] Message ID:', responseData.message_id || responseData.id || 'NOT_RETURNED');
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
          console.log('🔄 [REFRESH] Messages after send:', {
            totalMessages: refreshData.messages?.length || 0,
            messageIds: refreshData.messages?.map(m => m.id) || [],
            senderIds: refreshData.messages?.map(m => m.sender_id) || []
          });
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
        console.error('❌ [SEND MESSAGE] Failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          conversationId,
          senderId: currentUserId
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  console.log('show me if its the customer', isCustomer);

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header - Refined and polished desktop layout */}
      <header
        ref={headerRef}
        className="flex-shrink-0 bg-background border-b border-border z-20"
      >
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 gap-4">
          {/* Left side - Back button */}
          <div className="flex items-center flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-muted/80 transition-colors -ml-2 min-h-[44px] min-w-[44px] rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Center - Tradesperson Info Section with better visual grouping */}
          <div className="flex-1 flex flex-col items-center justify-center px-3 overflow-hidden">
            {isCounterpartyLoading ? (
              <div className="flex items-center justify-center w-full py-3">
                <span className="sr-only">Loading contact details</span>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
              </div>
            ) : counterparty && isCustomer ? (
              <>
                <button
                  onClick={() => {
                    navigate(`/tradesperson/profile?nameId=${encodeURIComponent(counterparty.id)}`);
                  }}
                  className="flex flex-col items-center gap-3 group hover:bg-accent/50 rounded-xl px-4 py-3 transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 min-h-[44px] w-full max-w-md shadow-sm border border-transparent hover:border-border hover:shadow-md"
                  aria-label="View tradesperson profile"
                  title="Click to view tradesperson's full profile"
                >
                  {/* Avatar and Name Row */}
                  <div className="flex items-center gap-3 w-full justify-center">
                    {/* Avatar - slightly larger for better prominence */}
                    {counterparty.avatar_url ? (
                      <img
                        src={counterparty.avatar_url}
                        alt={counterparty.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-border shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2 border-border shadow-sm flex-shrink-0">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}

                    {/* Name and Trade */}
                     <div className="flex flex-col items-start min-w-0 gap-1.5">
                       <div className="flex items-center gap-2">
                         <h1 className="text-base font-semibold text-slate-900 tracking-tight truncate">
                          {counterparty.name}
                        </h1>
                        <svg
                           className="w-4 h-4 text-blue-500 flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {counterparty.job_title && (
                         <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 truncate max-w-[260px]">
                          {counterparty.job_title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone Number - visually distinct */}
                  {resolvedCounterpartyPhone && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-slate-900 text-sm font-semibold shadow-sm">
                      <Phone className="h-4 w-4 text-slate-900" aria-hidden="true" />
                      {resolvedCounterpartyPhone}
                    </div>
                  )}
                </button>

                {/* Hint text - more subtle and better styled */}
                <p className="text-xs text-muted-foreground mt-2 text-center px-2 max-w-md leading-relaxed">
                  💡 Click above to view their full profile
                </p>
              </>
            ) : counterparty ? (
                <div 
                 className="flex flex-col items-center gap-3 px-4 py-3 w-full max-w-md rounded-xl"
               
                >
                {/* Non-clickable version for traders */}
                 <div 
                 style={{ cursor: 'pointer' }} className="flex items-center gap-3 w-full justify-center"
                 onClick={() => {
                  navigate(`/jobs/${counterparty?.project_id}`)
                }}
                 >
                  {counterparty.avatar_url ? (
                    <img
                      src={counterparty.avatar_url}
                      alt={counterparty.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-border/60 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2 border-border/60 shadow-sm flex-shrink-0">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                   <div className="flex flex-col items-start gap-1.5 min-w-0">
                     <h1 className="text-base font-semibold text-slate-900 tracking-tight truncate">
                      {counterparty.name}
                    </h1>
                    {counterparty.job_title && (
                       <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 truncate max-w-[260px]">
                        {counterparty.job_title}
                      </span>
                    )}
                  </div>
                </div>
                {resolvedCounterpartyPhone && (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Phone className="w-4 h-4 text-slate-900" aria-hidden="true" />
                    {resolvedCounterpartyPhone}
                  </span>
                )}
              </div>
            ) : (
              <h1 className="font-semibold text-base text-foreground truncate py-3">
                {isPaymentFlow ? homeownerName : 'Chat'}
              </h1>
            )}
          </div>

          {/* Right side - Conversations button (mobile only) */}
          <div className="flex items-center gap-2 flex-shrink-0 sm:hidden">
            <Button
              variant="default"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="min-h-[44px] px-4 text-sm font-semibold shadow-sm rounded-lg"
              aria-label="Open conversations"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chats
            </Button>
          </div>
        </div>
      </header>

      {/* Subtle divider/shadow after header */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent shadow-sm"></div>

      {/* Job Info Header - Shows job context when a chat is selected and has messages or is payment flow */}
      {conversationId && !isLoadingMessages && messages.length > 0 && (conversation || counterparty) && (jobTitle || counterparty?.job_title || jobBudget || jobUrgency || jobCategory) && (
        <div ref={jobInfoRef} className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 z-10">
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
              {jobBudget && formatBudget(jobBudget) && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {formatBudget(jobBudget)}
                </Badge>
              )}

              {/* Urgency */}
              {jobUrgency && formatUrgency(jobUrgency) && (
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
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100dvh - var(--header-h, 0px))' }}>
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

        {/* Chat Content Area - Full height messaging layout */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {/* Messages Container - Scrollable area */}
          <div className="flex-1 overflow-y-auto overscroll-contain webkit-overflow-scrolling-touch">
            <div className="px-4 sm:px-6 py-6 min-h-full">
            {!conversationId && !isPaymentFlow ? (
              <div className="flex items-center justify-center min-h-full">
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
              <div className="flex items-center justify-center min-h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-full">
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
              <div className="max-w-4xl mx-auto pb-4">
                <MessageList
                  messages={messages}
                  conversation={conversation}
                  currentUserId={currentUserId}
                  counterparty={legacyCounterparty}
                />
              </div>
            )}
            </div>
          </div>

          {/* Follow-up Questions - Fixed above input */}
          {conversationId && jobId && followUpQuestions.length > 0 && (
            <div className="flex-shrink-0 border-t border-border bg-muted/30 backdrop-blur-sm">
              <div className="p-3 sm:p-4 max-w-4xl mx-auto">
                <FollowUpQuestions
                  questions={followUpQuestions}
                  mode="postpay"
                  onQuestionClick={(question) => handleSendMessage(question)}
                />
              </div>
            </div>
          )}

          {/* Message Input - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-inset-bottom">
            <div className="p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto bg-muted/40 rounded-2xl p-2.5 sm:p-3 shadow-sm border border-border/50 transition-all focus-within:border-primary/50 focus-within:shadow-md">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && conversationId) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={conversationId ? "Type your message..." : "Select a conversation to start chatting"}
                  disabled={!conversationId}
                  className="flex-1 bg-transparent outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50 px-2 min-h-[40px]"
                />
                <Button
                  size="sm"
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || !conversationId}
                  className="rounded-xl px-3 sm:px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 transition-all hover:scale-105 active:scale-95 min-h-[40px]"
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
