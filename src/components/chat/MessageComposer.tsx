import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HiPaperAirplane } from 'react-icons/hi2';
import { AlertCircle, X } from 'lucide-react';
import AttachmentUploader from '../chat-first/AttachmentUploader';

interface MessageComposerProps {
  onSendMessage: (body: string) => Promise<void>;
  disabled?: boolean;
  conversationStatus: 'open' | 'closed';
}

const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onSendMessage, 
  disabled = false,
  conversationStatus
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    setError(null);
    
    try {
      await onSendMessage(message.trim());
      setMessage('');
      setAttachments([]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
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

  const canSend = message.trim() && !isSending && !disabled && conversationStatus === 'open';

  if (conversationStatus === 'closed') {
    return (
      <div className="border-t border-border bg-muted/30 p-4">
        <div className="text-center text-sm text-muted-foreground">
          This conversation has been closed
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-background sticky bottom-0 pb-safe-bottom shadow-lg">
      {/* Error Banner */}
      {error && (
        <Alert variant="destructive" className="mx-4 mt-4 mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="h-auto p-1 ml-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="p-4 sm:p-6">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div 
                key={index}
                className="inline-flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              disabled={disabled || isSending}
              className="min-h-[48px] max-h-[120px] resize-none text-base leading-relaxed"
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
              size="sm"
              className="px-4 py-2 min-h-[44px]"
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
      </div>
    </div>
  );
};

export default MessageComposer;