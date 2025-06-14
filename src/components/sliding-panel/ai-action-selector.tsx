import { BookOpen, Lightbulb, Sparkles } from "lucide-react";
import { useAIAction } from "@/hooks/use-ai-action";

interface AIActionSelectorProps {
  packageName: string;
}

export function AIActionSelector({ packageName }: AIActionSelectorProps) {
  const { executeAction } = useAIAction();

  return (
    <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center space-y-4 md:space-y-6">
      <div className="text-center mb-6 md:mb-8">
        <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-3 md:mb-4" />
        <h3 className="text-lg md:text-xl font-bold text-white mb-2">
          What would you like me to do?
        </h3>
        <p className="text-sm md:text-base text-gray-400 px-2">
          Choose an AI action for &ldquo;{packageName}&rdquo;
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3 md:space-y-4">
        <button
          onClick={() => executeAction("explain", packageName)}
          className="w-full p-4 md:p-6 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-gray-700 hover:border-purple-500 rounded-lg text-left transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm md:text-base">
                Explain This Package
              </h4>
              <p className="text-xs md:text-sm text-gray-400">
                Get a simple explanation
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => executeAction("generate", packageName)}
          className="w-full p-4 md:p-6 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-gray-700 hover:border-purple-500 rounded-lg text-left transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm md:text-base">
                Generate Ideas
              </h4>
              <p className="text-xs md:text-sm text-gray-400">
                Get project ideas
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
