import { Loader2 } from "lucide-react";
import { AIAction } from "@/types";

interface AILoadingStateProps {
  action: AIAction;
}

export function AILoadingState({ action }: AILoadingStateProps) {
  const getLoadingText = () => {
    switch (action) {
      case "explain":
        return "Analyzing package...";
      case "generate":
        return "Generating ideas...";
      case "readme":
        return "Loading README...";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4 px-4">
      <div className="relative">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <div className="absolute inset-0 rounded-full border-2 border-purple-400/20 animate-pulse" />
      </div>
      <p className="text-gray-400 text-center text-sm md:text-base">
        {getLoadingText()}
      </p>
    </div>
  );
}
