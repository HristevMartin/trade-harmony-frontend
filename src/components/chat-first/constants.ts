export const COPY_STRINGS = {
  TITLE: "Payment successful — your application is open",
  SUBTITLE: "Start a conversation to stand out. The homeowner can share contact details later.",
  BADGE_TEXT: "Contact hidden • Safe to chat here",
  CHAT_INTRO_TITLE: "Let's chat",
  CHAT_BENEFITS: [
    "Introduce yourself",
    "Share availability & quote", 
    "Attach portfolio photos"
  ],
  SEND_AND_OPEN_CHAT: "Open Chat",
  CLOSE: "Close",
  SEND: "Send",
  OPEN_FULL_CHAT: "Open full chat",
  EMPTY_CHAT: "No messages yet. Say hello!",
  CONTACT_NOTE: "Contact details are hidden until the homeowner shares them.",
  ERROR_RETRY: "Couldn't start chat—try again",
  RETRY: "Retry"
} as const;

export const MESSAGE_TEMPLATE = (homeownerName: string) => 
  `Hi ${homeownerName}, I'm interested in your job. I'm available this week and can provide a competitive quote.`;
