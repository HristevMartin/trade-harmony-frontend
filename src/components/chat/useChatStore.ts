import { useState, useEffect, useCallback, useRef } from 'react';

// Types matching new API response structure
export type Counterparty = {
  id: string;
  name: string;
  avatar_url?: string;
  job_title?: string;
  lastActiveAt?: string; // ISO timestamp of last activity
};

export type ChatItem = {
  conversation_id: string;
  job_id: string;
  user_role: 'homeowner' | 'trader';
  status: string;
  last_message_at: string;
  message_count: number;
  created_at: string;
  counterparty: Counterparty;
  unread_count?: number; // Added for unread message count
};

// Legacy types for backward compatibility
export type UserRef = { 
  id: string; 
  name: string; 
  avatarUrl?: string; 
  role: 'homeowner' | 'trader' 
};

export type Conversation = {
  id: string;
  jobId: string;
  jobTitle: string;
  homeowner: UserRef;
  trader: UserRef;
  createdAt: number;
  status: 'open' | 'closed';
  canViewPhone?: boolean;
  canViewEmail?: boolean;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
  pending?: boolean;
};

// In-memory store
class ChatStore {
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message[]>();
  private subscribers = new Set<() => void>();

  constructor() {
    // Seed with mock data
    this.seedMockData();
  }

  private seedMockData() {
    // Create some demo conversations with varied participants
    const conversations = [
      {
        id: 'conv_123',
        jobId: 'job_kitchen_remodel',
        jobTitle: 'Kitchen Remodel - Modern Upgrade',
        homeowner: {
          id: 'homeowner_sarah_456',
          name: 'Sarah Johnson',  
          avatarUrl: '/lovable-uploads/50d7664d-cb5a-4d65-be0b-95cdbb52e68f.png',
          role: 'homeowner' as const
        },
        trader: {
          id: '68ac564b8ee4f90af6a56a108',
          name: 'You',
          role: 'trader' as const
        },
        createdAt: Date.now() - 86400000, // 1 day ago
        status: 'open' as const,
        canViewPhone: true,
        canViewEmail: false
      },
      {
        id: 'conv_456', 
        jobId: 'job_bathroom_repair',
        jobTitle: 'Bathroom Plumbing Repair',
        homeowner: {
          id: 'homeowner_martin_789',
          name: 'Martin Smith',
          role: 'homeowner' as const
        },
        trader: {
          id: '68ac564b8ee4f90af6a56a108', 
          name: 'You',
          role: 'trader' as const
        },
        createdAt: Date.now() - 172800000, // 2 days ago
        status: 'open' as const,
        canViewPhone: false,
        canViewEmail: true
      }
    ];

    conversations.forEach(conv => {
      this.conversations.set(conv.id, conv);
      // Add some demo messages
      const messages: Message[] = [
        {
          id: `msg_${conv.id}_1`,
          conversationId: conv.id,
          senderId: conv.homeowner.id,
          body: `Hi! I'm interested in discussing the ${conv.jobTitle.toLowerCase()}. When would be a good time to talk?`,
          createdAt: conv.createdAt + 3600000 // 1 hour after conversation created
        },
        {
          id: `msg_${conv.id}_2`, 
          conversationId: conv.id,
          senderId: conv.trader.id,
          body: 'Thanks for reaching out! I have availability this week. What\'s your budget range for this project?',
          createdAt: conv.createdAt + 7200000 // 2 hours after  
        }
      ];
      this.messages.set(conv.id, messages);
    });
  }

  createOrGetConversation(params: {
    conversationId: string;
    jobId?: string;
    jobTitle?: string;
    homeowner?: { id: string; name: string };
    trader?: { id: string; name: string };
  }): Conversation {
    const existing = this.conversations.get(params.conversationId);
    if (existing) {
      console.log('Found existing conversation:', existing);
      return existing;
    }

    // Create new conversation with provided or default data
    const newConversation: Conversation = {
      id: params.conversationId,
      jobId: params.jobId || `job_${Date.now()}`,
      jobTitle: params.jobTitle || 'Project Discussion',
      homeowner: params.homeowner ? {
        ...params.homeowner,
        role: 'homeowner' as const
      } : {
        id: 'homeowner_martin_789',
        name: 'Martin',
        role: 'homeowner' as const
      },
      trader: params.trader ? {
        ...params.trader,
        role: 'trader' as const
      } : {
        id: '68ac564b8ee4f90af6a56a108',
        name: 'You',
        role: 'trader' as const
      },
      createdAt: Date.now(),
      status: 'open',
      canViewPhone: false,
      canViewEmail: false
    };

    console.log('Creating new conversation:', newConversation);
    this.conversations.set(params.conversationId, newConversation);
    this.messages.set(params.conversationId, []);
    this.notifySubscribers();
    
    return newConversation;
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  getConversation(id: string): Conversation | undefined {
    console.log('Looking for conversation:', id);
    console.log('Available conversations:', Array.from(this.conversations.keys()));
    return this.conversations.get(id);
  }

  listMessages(conversationId: string): Message[] {
    return this.messages.get(conversationId) || [];
  }

  async sendMessage({ 
    conversationId, 
    senderId, 
    body 
  }: { 
    conversationId: string; 
    senderId: string; 
    body: string; 
  }): Promise<Message> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message: Message = {
      id: messageId,
      conversationId,
      senderId,
      body,
      createdAt: Date.now(),
      pending: true
    };

    // Add optimistic message
    const existingMessages = this.messages.get(conversationId) || [];
    this.messages.set(conversationId, [...existingMessages, message]);
    this.notifySubscribers();

    // Simulate network delay and random failure
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 10% chance of failure
        if (Math.random() < 0.1) {
          // Remove failed message
          const currentMessages = this.messages.get(conversationId) || [];
          this.messages.set(conversationId, currentMessages.filter(m => m.id !== messageId));
          this.notifySubscribers();
          reject(new Error('Failed to send message'));
          return;
        }

        // Success - remove pending flag
        const currentMessages = this.messages.get(conversationId) || [];
        const updatedMessages = currentMessages.map(m => 
          m.id === messageId ? { ...m, pending: false } : m
        );
        this.messages.set(conversationId, updatedMessages);
        this.notifySubscribers();
        resolve({ ...message, pending: false });
      }, Math.random() * 400 + 400); // 400-800ms delay
    });
  }

  // List all conversations
  listConversations(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.createdAt - a.createdAt); // Most recent first
  }

  // For demo purposes - toggle contact sharing
  toggleContactSharing(conversationId: string, type: 'phone' | 'email') {
    const conv = this.conversations.get(conversationId);
    if (conv) {
      const updatedConv = {
        ...conv,
        [type === 'phone' ? 'canViewPhone' : 'canViewEmail']: !conv[type === 'phone' ? 'canViewPhone' : 'canViewEmail']
      };
      this.conversations.set(conversationId, updatedConv);
      this.notifySubscribers();
    }
  }
}

const chatStore = new ChatStore();

// New hook for fetching chats from API
export const useChats = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  // Set up a timeout to prevent infinite loading if no fetchChats is called
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !isFetchingRef.current) {
        console.log('No fetchChats called within 2 seconds, setting loading to false');
        setIsLoading(false);
      }
    }, 2000); // 2 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const fetchChats = useCallback(async (authToken: string) => {
    console.log('fetchChats called with authToken:', !!authToken);
    
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('fetchChats already in progress, skipping');
      return;
    }
    
    // For session-based auth, we still need some indicator that user is authenticated
    if (!authToken) {
      console.warn('No auth token provided to fetchChats');
      setError('No auth token provided');
      setIsLoading(false);
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Fetch both chats and chat summary in parallel
      const [chatsResponse, summaryResponse] = await Promise.all([
        fetch(`${apiUrl}/travel/chat-component/get-all-chats`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${apiUrl}/travel/chat-component/chat-summary`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!chatsResponse.ok) {
        console.error('Chats API error:', {
          status: chatsResponse.status,
          statusText: chatsResponse.statusText,
          url: `${apiUrl}/travel/chat-component/get-all-chats`
        });
        throw new Error(`Failed to fetch chats: ${chatsResponse.status} ${chatsResponse.statusText}`);
      }

      const chatsData = await chatsResponse.json();
      console.log('Fetched chats data:', chatsData);
      console.log('Number of chats:', chatsData?.chats?.length || 0);
      console.log('Raw chats array:', chatsData?.chats);
      console.log('Data keys:', Object.keys(chatsData || {}));
      
      let chatItems: ChatItem[] = chatsData.chats || chatsData || [];
      console.log('Processed chatItems:', chatItems);

      // If summary response is successful, merge unread counts
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        console.log('Fetched chat summary:', summaryData);
        
        const summaryConversations = summaryData.conversations || [];
        
        // Create a map of conversation_id to unread_count for quick lookup
        const unreadCountMap = new Map();
        summaryConversations.forEach((conv: any) => {
          unreadCountMap.set(conv.conversation_id, conv.unread_count || 0);
        });
        
        // Merge unread counts into chat items
        chatItems = chatItems.map(chat => ({
          ...chat,
          unread_count: unreadCountMap.get(chat.conversation_id) || 0
        }));
      }
      
      setChats(chatItems);
      console.log('Successfully set chats:', chatItems.length);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      console.log('Setting isLoading to false');
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []); // Empty dependency array - function doesn't depend on any state

  return {
    chats,
    isLoading,
    error,
    fetchChats,
    refetch: (authToken: string) => fetchChats(authToken)
  };
};

export const useChatStore = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = chatStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  return {
    getConversation: (id: string) => chatStore.getConversation(id),
    createOrGetConversation: (params: any) => chatStore.createOrGetConversation(params),
    listMessages: (conversationId: string) => chatStore.listMessages(conversationId),
    listConversations: () => chatStore.listConversations(),
    sendMessage: (input: { conversationId: string; senderId: string; body: string }) => 
      chatStore.sendMessage(input),
    toggleContactSharing: (conversationId: string, type: 'phone' | 'email') => 
      chatStore.toggleContactSharing(conversationId, type)
  };
};