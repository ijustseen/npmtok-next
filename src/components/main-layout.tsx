"use client";

import { useAIPanel } from "@/contexts/ai-panel-context";
import { AISlidingPanel } from "./sliding-panel";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { panelState, closePanel } = useAIPanel();

  return (
    <>
      {/* Main content area that shrinks when panel is open */}
      <div
        className={`transition-all duration-300 ease-out ${
          panelState.isOpen ? "md:mr-[50vw] mr-0" : "mr-0"
        }`}
      >
        {children}
      </div>

      {/* AI Sliding Panel */}
      <AISlidingPanel
        isOpen={panelState.isOpen}
        onClose={closePanel}
        response={panelState.response}
        isLoading={panelState.isLoading}
        action={panelState.action}
        packageName={panelState.packageName}
        isDemo={panelState.isDemo}
        isSelectingAction={panelState.isSelectingAction}
        repository={panelState.repository}
      />
    </>
  );
}
