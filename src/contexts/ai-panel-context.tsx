"use client";

import React, { createContext, useContext, useState } from "react";

interface AIPanelState {
  isOpen: boolean;
  response: string | null;
  isLoading: boolean;
  action: "explain" | "generate" | "readme" | null;
  packageName: string;
  isDemo: boolean;
  isSelectingAction: boolean;
  repository: { owner: string; name: string } | null;
}

interface AIPanelContextType {
  panelState: AIPanelState;
  openPanel: (
    packageName: string,
    repository?: { owner: string; name: string } | null
  ) => void;
  openReadme: (
    packageName: string,
    repository: { owner: string; name: string }
  ) => void;
  selectAction: (action: "explain" | "generate") => void;
  closePanel: () => void;
  setResponse: (response: string, isDemo: boolean) => void;
  setLoading: (loading: boolean) => void;
}

const AIPanelContext = createContext<AIPanelContextType | undefined>(undefined);

export function AIPanelProvider({ children }: { children: React.ReactNode }) {
  const [panelState, setPanelState] = useState<AIPanelState>({
    isOpen: false,
    response: null,
    isLoading: false,
    action: null,
    packageName: "",
    isDemo: false,
    isSelectingAction: false,
    repository: null,
  });

  const openPanel = (
    packageName: string,
    repository?: { owner: string; name: string } | null
  ) => {
    setPanelState({
      isOpen: true,
      response: null,
      isLoading: false,
      action: null,
      packageName,
      isDemo: false,
      isSelectingAction: true,
      repository: repository || null,
    });
  };

  const openReadme = (
    packageName: string,
    repository: { owner: string; name: string }
  ) => {
    setPanelState({
      isOpen: true,
      response: null,
      isLoading: true,
      action: "readme",
      packageName,
      isDemo: false,
      isSelectingAction: false,
      repository,
    });
  };

  const selectAction = (action: "explain" | "generate") => {
    setPanelState((prev) => ({
      ...prev,
      action,
      isSelectingAction: false,
      isLoading: true,
    }));
  };

  const closePanel = () => {
    setPanelState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const setResponse = (response: string, isDemo: boolean) => {
    setPanelState((prev) => ({
      ...prev,
      response,
      isLoading: false,
      isDemo,
    }));
  };

  const setLoading = (loading: boolean) => {
    setPanelState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  };

  return (
    <AIPanelContext.Provider
      value={{
        panelState,
        openPanel,
        openReadme,
        selectAction,
        closePanel,
        setResponse,
        setLoading,
      }}
    >
      {children}
    </AIPanelContext.Provider>
  );
}

export function useAIPanel() {
  const context = useContext(AIPanelContext);
  if (!context) {
    throw new Error("useAIPanel must be used within AIPanelProvider");
  }
  return context;
}
