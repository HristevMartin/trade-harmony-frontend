import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateJobDraft } from "@/lib/ai/placeholders";
import { DraftPreview } from "./DraftPreview";
import type { JobDraft } from "@/lib/ai/placeholders";

interface AiJobAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onUseDraft: (draft: JobDraft) => void;
}

export function AiJobAssistant({ isOpen, onClose, onUseDraft }: AiJobAssistantProps) {
  const [inputText, setInputText] = useState("");
  const [draft, setDraft] = useState<JobDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const generatedDraft = generateJobDraft(inputText);
      setDraft(generatedDraft);
    } catch (error) {
      console.error("Error generating draft:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setDraft(null);
  };

  const handleUse = () => {
    if (draft) {
      onUseDraft(draft);
      onClose();
    }
  };

  const handleClose = () => {
    setInputText("");
    setDraft(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-trust-blue" />
              AI Job Assistant
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {!draft ? (
            <>
              <div className="space-y-2">
                <label htmlFor="job-description" className="text-sm font-medium text-foreground">
                  Describe the job you need done
                </label>
                <Textarea
                  id="job-description"
                  placeholder="Example: I need a plumber to fix a leaking tap in my kitchen. It's been dripping for a few days and needs to be fixed soon."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Be as detailed as you like - our AI will understand and create a structured job post
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!inputText.trim() || isGenerating}
                className="w-full bg-trust-blue text-trust-blue-foreground hover:bg-trust-blue/90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Job Post
                  </>
                )}
              </Button>
            </>
          ) : (
            <DraftPreview
              draft={draft}
              onUseAndEdit={handleUse}
              onRegenerate={handleRegenerate}
              onCancel={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
