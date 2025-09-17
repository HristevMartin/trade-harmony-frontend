import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Conversation, Message, Store } from './types';

type ChatState = {
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
};

type ChatAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_MESSAGES'; payload: { conversationId: string; messages: Message[] } };

const initialState: ChatState = {
  conversations: {},
  messages: {},
  loading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [action.payload.id]: action.payload,
        },
      };
    case 'ADD_MESSAGE':
      const conversationId = action.payload.conversationId;
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            action.payload,
          ],
        },
      };
    case 'UPDATE_MESSAGE':
      const updatedMessages = { ...state.messages };
      Object.keys(updatedMessages).forEach(convId => {
        updatedMessages[convId] = updatedMessages[convId].map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        );
      });
      return { ...state, messages: updatedMessages };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
      };
    default:
      return state;
  }
}

const ChatContext = createContext<{
  state: ChatState;
  store: Store;
} | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const store: Store = {
    conversations: state.conversations,
    messages: state.messages,

    async createOrGetConversation(input: { jobId: string; homeownerId: string; traderId: string }): Promise<Conversation> {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Simulate 10% chance of error
      if (Math.random() < 0.1) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create conversation' });
        dispatch({ type: 'SET_LOADING', payload: false });
        throw new Error('Failed to create conversation');
      }

      // Check if conversation already exists (idempotent)
      const existingConv = Object.values(state.conversations).find(
        conv => conv.jobId === input.jobId && 
                conv.homeownerId === input.homeownerId && 
                conv.traderId === input.traderId
      );

      if (existingConv) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return existingConv;
      }

      // Create new conversation with fake latency
      return new Promise((resolve) => {
        setTimeout(() => {
          const conversation: Conversation = {
            id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            jobId: input.jobId,
            homeownerId: input.homeownerId,
            traderId: input.traderId,
            createdAt: Date.now(),
            status: 'open',
          };

          dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
          dispatch({ type: 'SET_LOADING', payload: false });
          resolve(conversation);
        }, 400 + Math.random() * 400); // 400-800ms delay
      });
    },

    async listMessages(conversationId: string): Promise<Message[]> {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const messages = state.messages[conversationId] || [];
          dispatch({ type: 'SET_LOADING', payload: false });
          resolve(messages);
        }, 200);
      });
    },

    async sendMessage(input: { conversationId: string; senderId: string; body: string; attachments?: File[] }): Promise<Message> {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create pending message
      const pendingMessage: Message = {
        id: messageId,
        conversationId: input.conversationId,
        senderId: input.senderId,
        body: input.body,
        createdAt: Date.now(),
        pending: true,
        attachments: input.attachments?.map(file => ({
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
        })),
      };

      dispatch({ type: 'ADD_MESSAGE', payload: pendingMessage });

      // Simulate network delay and resolve pending state
      return new Promise((resolve) => {
        setTimeout(() => {
          const finalMessage = { ...pendingMessage, pending: false };
          dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, updates: { pending: false } } });
          resolve(finalMessage);
        }, 400 + Math.random() * 400); // 400-800ms delay
      });
    },
  };

  return (
    <ChatContext.Provider value={{ state, store }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatStore() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatStore must be used within a ChatProvider');
  }
  return context;
}
