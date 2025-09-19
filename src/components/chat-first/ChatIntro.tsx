import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { HiCheckCircle, HiChatBubbleLeftRight, HiSparkles } from 'react-icons/hi2';
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
  const maxChars = 500;
  const charsRemaining = maxChars - message.length;

  const handleSendClick = () => {
    if (message.trim() && !isLoading) {
      onSendAndOpenChat(message.trim());
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <HiChatBubbleLeftRight className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
              <HiSparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">
            {COPY_STRINGS.CHAT_INTRO_TITLE}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed px-2">
            {COPY_STRINGS.CONTACT_NOTE}
          </p>
        </div>
      </div>

      {/* Benefits Card */}
      <Card className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-sm">
        <h4 className="font-semibold text-blue-900 mb-3 text-sm md:text-base flex items-center gap-2">
          <HiSparkles className="w-4 h-4" />
          What to include:
        </h4>
        <div className="space-y-2">
          {COPY_STRINGS.CHAT_BENEFITS.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <HiCheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-xs md:text-sm text-blue-800 leading-relaxed">{benefit}</span>
            </div>
          ))}
        </div>
      </Card>


      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleSendClick}
          disabled={!message.trim() || isLoading || charsRemaining < 0}
          className="flex-1 bg-gradient-to-r from-trust-blue to-blue-600 hover:from-trust-blue/90 hover:to-blue-600/90 text-white font-semibold py-3 md:py-4 text-sm md:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:hover:shadow-none"
          aria-label="Send message and open chat"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Starting chat...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <HiChatBubbleLeftRight className="w-4 h-4" />
              <span>{COPY_STRINGS.SEND_AND_OPEN_CHAT}</span>
            </div>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="sm:w-auto border-2 py-3 md:py-4 font-medium"
          aria-label="Close modal"
        >
          {COPY_STRINGS.CLOSE}
        </Button>
      </div>
    </div>
  );
};

export default ChatIntro;