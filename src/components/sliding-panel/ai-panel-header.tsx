import { X, Copy, Check, Sparkles } from "lucide-react";

interface AIPanelHeaderProps {
  title: string;
  packageName: string;
  response: string | null;
  isLoading: boolean;
  isCopied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

export function AIPanelHeader({
  title,
  packageName,
  response,
  isLoading,
  isCopied,
  onCopy,
  onClose,
}: AIPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 md:p-6 border-b border-gray-700">
      <div className="flex items-center space-x-2 min-w-0 flex-1 mr-3">
        <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <h2 className="text-sm md:text-lg font-bold text-white truncate">
          {title}
        </h2>
        <span className="text-xs text-gray-500 truncate hidden sm:inline">
          {packageName}
        </span>
      </div>
      <div className="flex items-center space-x-1 flex-shrink-0">
        {response && !isLoading && (
          <button
            onClick={onCopy}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            title="Copy response"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
