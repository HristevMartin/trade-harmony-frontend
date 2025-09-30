import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RefreshCw, X } from "lucide-react";
import type { JobDraft } from "@/lib/ai/placeholders";

interface DraftPreviewProps {
  draft: JobDraft;
  onUseAndEdit: () => void;
  onRegenerate: () => void;
  onCancel: () => void;
}

export function DraftPreview({ draft, onUseAndEdit, onRegenerate, onCancel }: DraftPreviewProps) {
  const urgencyColors = {
    urgent: "bg-red-500 text-white",
    flexible: "bg-trust-blue text-trust-blue-foreground",
    planned: "bg-trust-green text-trust-green-foreground",
  };

  return (
    <div className="space-y-4">
      <Card className="border-trust-blue/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Category */}
            <div>
              <Badge variant="secondary" className="mb-2">
                {draft.categoryLabel}
              </Badge>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Job Title
              </label>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {draft.title}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </label>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                {draft.description}
              </p>
            </div>

            {/* Urgency */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Urgency
              </label>
              <div className="mt-1">
                <Badge className={urgencyColors[draft.urgency]}>
                  {draft.urgency.charAt(0).toUpperCase() + draft.urgency.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Budget (if provided) */}
            {draft.suggestedBudget && (draft.suggestedBudget.min || draft.suggestedBudget.max) && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggested Budget
                </label>
                <p className="mt-1 text-sm font-medium text-foreground">
                  £{draft.suggestedBudget.min || 0} - £{draft.suggestedBudget.max || 0}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onUseAndEdit}
          className="flex-1 bg-trust-green text-trust-green-foreground hover:bg-trust-green/90"
          size="lg"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Use & Edit
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="lg"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
