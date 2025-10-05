import React, { useState, useRef, KeyboardEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HiPaperAirplane } from 'react-icons/hi2';
import AttachmentUploader from './AttachmentUploader';
import { COPY_STRINGS } from './constants';

interface MessageComposerProps {
  onSendMessage: (body: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  conversationId?: string;
  homeownerName?: string;
  traderName?: string;
  currentUserId?: string;
  jobTitle?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Type your message...",
  conversationId,
  homeownerName,
  traderName,
  currentUserId,
  jobTitle
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    
    setIsSending(true);
    try {
      await onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim() || attachments.length > 0) && !isSending && !disabled;

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg text-sm border border-primary/20"
            >
              <span className="truncate max-w-[120px] text-foreground">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3 bg-muted/30 rounded-2xl p-3 shadow-sm border border-border/50">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              className="min-h-[44px] max-h-[120px] resize-none bg-background border-0 focus-visible:ring-0 shadow-none rounded-xl"
              rows={1}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <AttachmentUploader 
              onFilesSelected={handleFilesSelected}
              disabled={disabled || isSending}
            />
            <Button
              onClick={handleSend}
              disabled={!canSend}
              size="icon"
              className="rounded-xl h-11 w-11"
              aria-label="Send message"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiPaperAirplane className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Full Chat Link - only show if not already in full chat */}
      {location.pathname !== '/chat' && (
        <div className="mt-2 text-center">
          <button 
            className="text-xs text-muted-foreground hover:text-foreground underline"
            onClick={() => {
              // Build chat URL with current parameters
              const params = new URLSearchParams();
              params.set('conversation_id', conversationId || 'conv_123');
              params.set('homeowner_name', homeownerName || 'Sarah Johnson');
              params.set('trader_name', traderName || 'Mike Thompson');
              params.set('current_user_id', currentUserId || 'user_123');
              params.set('job_title', jobTitle || 'Home Renovation Project');
              
              const chatUrl = `/chat?${params.toString()}`;
              window.open(chatUrl, '_blank');
            }}
          >
            {COPY_STRINGS.OPEN_FULL_CHAT}
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageComposer;
