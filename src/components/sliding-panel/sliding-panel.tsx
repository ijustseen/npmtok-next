"use client";

import { useEffect } from "react";
import { useReadme } from "@/hooks/use-readme";
import { useCopy } from "@/hooks/use-copy";
import { AIPanelHeader } from "./ai-panel-header";
import { AIActionSelector } from "./ai-action-selector";
import { AILoadingState } from "./ai-loading-state";
import { AIResponseContent } from "./ai-response-content";
import { Repository, AIAction } from "@/types";

interface AISlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  response: string | null;
  isLoading: boolean;
  action: AIAction;
  packageName: string;
  isDemo?: boolean;
  isSelectingAction: boolean;
  repository: Repository | null;
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
  const { loadReadme } = useReadme();
  const { isCopied, copyToClipboard } = useCopy();

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
    if (response) {
      await copyToClipboard(response);
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

  const renderContent = () => {
    if (isSelectingAction) {
      return <AIActionSelector packageName={packageName} />;
    }

    if (isLoading) {
      return <AILoadingState action={action} />;
    }

    if (response) {
      return <AIResponseContent response={response} />;
    }

    return null;
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
        <AIPanelHeader
          title={getTitle()}
          packageName={packageName}
          response={response}
          isLoading={isLoading}
          isCopied={isCopied}
          onCopy={handleCopy}
          onClose={onClose}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-full pb-20">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
