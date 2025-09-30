import { Lock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sampleQuestions = [
  "Is the property residential or commercial?",
  "Do you have access to the affected area?",
  "Are there any safety concerns?",
  "When would you like the work completed?",
  "Do you have any material preferences?",
  "Will anyone be at the property during work?",
];

export function SmartQuestionsTeaser() {
  return (
    <Card className="border-dashed border-2 border-muted bg-muted/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Smart Questions</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
            <Lock className="h-3 w-3" />
            Premium
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Unlock AI-generated questions to help traders provide better quotes
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((question, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
            >
              <Lock className="h-3 w-3 mr-1" />
              {question}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          These questions will be available after you post your job
        </p>
      </CardContent>
    </Card>
  );
}
