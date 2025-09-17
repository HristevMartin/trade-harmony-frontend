import { useState, useEffect } from 'react';

// Types
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
    // Seed with mock data based on common URL patterns
    this.seedMockData();
  }

  private seedMockData() {
    const mockConversations: Conversation[] = [
      {
        id: 'conv_175819613200_lnzrl80k',
        jobId: 'job_16d5dda3-3cf2-4d1c-9988-79492e05ee4e',
        jobTitle: 'Kitchen Renovation Project',
        homeowner: {
          id: 'homeowner_sarah_123',
          name: 'Sarah Johnson',
          role: 'homeowner'
        },
        trader: {
          id: 'trader_mike_456',
          name: 'Mike Thompson', 
          role: 'trader'
        },
        createdAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        status: 'open',
        canViewPhone: false,
        canViewEmail: false
      },
      {
        id: 'conv_175819613201_test123',
        jobId: 'job_test_456',
        jobTitle: 'Bathroom Remodel',
        homeowner: {
          id: 'homeowner_martin_789',
          name: 'Martin',
          role: 'homeowner'
        },
        trader: {
          id: 'trader_you_123',
          name: 'You',
          role: 'trader'
        },
        createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
        status: 'open',
        canViewPhone: false,
        canViewEmail: false
      }
    ];

    mockConversations.forEach(conv => {
      this.conversations.set(conv.id, conv);
      this.messages.set(conv.id, []);
    });
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
    listMessages: (conversationId: string) => chatStore.listMessages(conversationId),
    sendMessage: (input: { conversationId: string; senderId: string; body: string }) => 
      chatStore.sendMessage(input),
    toggleContactSharing: (conversationId: string, type: 'phone' | 'email') => 
      chatStore.toggleContactSharing(conversationId, type)
  };
};