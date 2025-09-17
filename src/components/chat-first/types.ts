export type Conversation = {
  id: string;
  jobId: string;
  homeownerId: string;
  traderId: string;
  createdAt: number;
  status: 'open' | 'closed';
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
  attachments?: { id: string; name: string }[];
  pending?: boolean;
};

export type Store = {
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
  createOrGetConversation(input: { jobId: string; homeownerId: string; traderId: string }): Promise<Conversation>;
  listMessages(conversationId: string): Promise<Message[]>;
  sendMessage(input: { conversationId: string; senderId: string; body: string; attachments?: File[] }): Promise<Message>;
};

export type ChatStage = 'success' | 'chat_intro' | 'chat_live';

export type PaymentSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  homeowner: { id: string; name: string };
  trader: { id: string; name: string };
  existingConversationId?: string;
};
