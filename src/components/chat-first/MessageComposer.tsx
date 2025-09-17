import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HiPaperAirplane } from 'react-icons/hi2';
import AttachmentUploader from './AttachmentUploader';
import { COPY_STRINGS } from './constants';

interface MessageComposerProps {
  onSendMessage: (body: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="border-t border-border bg-background p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="inline-flex items-center gap-2 bg-muted px-2 py-1 rounded text-sm"
            >
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
        </div>
        
        <div className="flex items-center gap-1">
          <AttachmentUploader 
            onFilesSelected={handleFilesSelected}
            disabled={disabled || isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="sm"
            className="px-3"
            aria-label="Send message"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <HiPaperAirplane className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Full Chat Link */}
      <div className="mt-2 text-center">
        <button 
          className="text-xs text-muted-foreground hover:text-foreground underline"
          onClick={() => {/* TODO: Implement full chat navigation */}}
        >
          {COPY_STRINGS.OPEN_FULL_CHAT}
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;
