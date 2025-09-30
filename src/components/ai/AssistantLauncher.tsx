import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssistantLauncherProps {
  onClick: () => void;
}

export function AssistantLauncher({ onClick }: AssistantLauncherProps) {
  return (
    <div className="w-full bg-gradient-to-br from-trust-blue/5 to-trust-green/5 rounded-2xl p-6 border border-trust-blue/10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-trust-blue" />
            <h3 className="text-lg font-semibold text-foreground">
              Post your job with AI
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Just describe what you need, and our AI will help you create the perfect job post
          </p>
        </div>
        <Button 
          onClick={onClick}
          size="lg"
          className="bg-trust-blue text-trust-blue-foreground hover:bg-trust-blue/90 whitespace-nowrap"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Start
        </Button>
      </div>
    </div>
  );
}
