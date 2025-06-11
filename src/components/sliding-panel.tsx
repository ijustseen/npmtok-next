"use client";

import {
  X,
  Copy,
  Check,
  Loader2,
  Sparkles,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useAIAction } from "@/hooks/use-ai-action";
import { useReadme } from "@/hooks/use-readme";

interface AISlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  response: string | null;
  isLoading: boolean;
  action: "explain" | "generate" | "readme" | null;
  packageName: string;
  isDemo?: boolean;
  isSelectingAction: boolean;
  repository: { owner: string; name: string } | null;
}

export function AISlidingPanel({
  isOpen,
  onClose,
  response,
  isLoading,
  action,
  packageName,
  isDemo = false,
  isSelectingAction,
  repository,
}: AISlidingPanelProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { executeAction } = useAIAction();
  const { loadReadme } = useReadme();

  // Управление overflow для body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Автоматическая загрузка README
  useEffect(() => {
    if (action === "readme" && repository && isLoading) {
      loadReadme(repository);
    }
  }, [action, repository, isLoading, loadReadme]);

  const handleCopy = async () => {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const getTitle = () => {
    if (isSelectingAction) {
      return `AI Actions`;
    }
    if (action === "readme") {
      return `📖 README`;
    }
    const aiIndicator = isDemo ? " (Demo)" : "";
    if (action === "explain") {
      return `Explaining${aiIndicator}`;
    } else if (action === "generate") {
      return `Ideas${aiIndicator}`;
    }
    return `AI Response${aiIndicator}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full md:w-1/2 bg-[#0a0a0a] border-l border-gray-700 shadow-2xl transform transition-transform duration-300 ease-out z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-6 border-b border-gray-700 bg-[#121212]">
          <div className="flex items-center space-x-2 min-w-0 flex-1 mr-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <h2 className="text-sm md:text-lg font-bold text-white truncate">
              {getTitle()}
            </h2>
            {/* Показываем имя пакета отдельно для экономии места */}
            <span className="text-xs text-gray-500 truncate hidden sm:inline">
              {packageName}
            </span>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {response && !isLoading && (
              <button
                onClick={handleCopy}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-full pb-20">
          {isSelectingAction ? (
            // Action Selection Screen
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
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 px-4">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-purple-400" />
              <p className="text-gray-300 text-center text-sm md:text-base">
                {action === "explain"
                  ? "Analyzing package..."
                  : action === "generate"
                  ? "Generating ideas..."
                  : "Loading README..."}
              </p>
              <p className="text-gray-500 text-xs md:text-sm text-center">
                This may take a few seconds
              </p>
            </div>
          ) : response ? (
            <div className="p-4 md:p-6">
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-white mb-6 mt-8 first:mt-0 border-b border-gray-700 pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-white mb-4 mt-8 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-white mb-3 mt-6 first:mt-0">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-300 mb-4 leading-relaxed text-base">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">
                        {children}
                      </strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside text-gray-300 mb-6 space-y-2 pl-6">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-outside text-gray-300 mb-6 space-y-2 pl-6">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-300 leading-relaxed">
                        {children}
                      </li>
                    ),
                    em: ({ children }) => (
                      <em className="text-gray-400 italic">{children}</em>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm font-mono">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <div className="mb-6">
                        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                            <span className="text-gray-400 text-xs font-medium">
                              CODE
                            </span>
                          </div>
                          <pre className="p-4 overflow-x-auto">{children}</pre>
                        </div>
                      </div>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-500 pl-4 py-2 mb-4 bg-gray-800/50 italic text-gray-300">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-sm md:text-base">
                No response to display
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
