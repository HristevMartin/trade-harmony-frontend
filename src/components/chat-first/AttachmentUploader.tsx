import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { HiPaperClip } from 'react-icons/hi2';

interface AttachmentUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({ 
  onFilesSelected, 
  disabled = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload attachments"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        className="p-2 h-8 w-8"
        aria-label="Attach files"
      >
        <HiPaperClip className="h-4 w-4" />
      </Button>
    </>
  );
};

export default AttachmentUploader;
