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
      {/* Main content area without shifting */}
      {children}

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
