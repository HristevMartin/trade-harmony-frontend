import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { HiCheckCircle, HiChatBubbleLeftRight } from 'react-icons/hi2';
import { COPY_STRINGS, MESSAGE_TEMPLATE } from './constants';

interface ChatIntroProps {
  homeownerName: string;
  onSendAndOpenChat: (message: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const ChatIntro: React.FC<ChatIntroProps> = ({ 
  homeownerName, 
  onSendAndOpenChat, 
  onClose,
  isLoading = false 
}) => {
  const [message, setMessage] = useState(MESSAGE_TEMPLATE(homeownerName));

  const handleSendClick = () => {
    if (message.trim()) {
      onSendAndOpenChat(message.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
          <HiChatBubbleLeftRight className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {COPY_STRINGS.CHAT_INTRO_TITLE}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {COPY_STRINGS.CONTACT_NOTE}
        </p>
      </div>

      {/* Benefits Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3">What to include:</h4>
        <div className="space-y-2">
          {COPY_STRINGS.CHAT_BENEFITS.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <HiCheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-800">{benefit}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Message Template */}
      <div className="space-y-2">
        <label 
          htmlFor="intro-message" 
          className="block text-sm font-medium text-foreground"
        >
          Your first message:
        </label>
        <Textarea
          id="intro-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself and your interest in the job..."
          className="min-h-[100px] resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSendClick}
          disabled={!message.trim() || isLoading}
          className="flex-1"
          aria-label="Send message and open chat"
        >
          {isLoading ? 'Starting chat...' : COPY_STRINGS.SEND_AND_OPEN_CHAT}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close modal"
        >
          {COPY_STRINGS.CLOSE}
        </Button>
      </div>
    </div>
  );
};

export default ChatIntro;
