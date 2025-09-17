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
    // This will be called after we potentially create conversations dynamically
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
    createOrGetConversation: (params: any) => chatStore.createOrGetConversation(params),
    listMessages: (conversationId: string) => chatStore.listMessages(conversationId),
    sendMessage: (input: { conversationId: string; senderId: string; body: string }) => 
      chatStore.sendMessage(input),
    toggleContactSharing: (conversationId: string, type: 'phone' | 'email') => 
      chatStore.toggleContactSharing(conversationId, type)
  };
};