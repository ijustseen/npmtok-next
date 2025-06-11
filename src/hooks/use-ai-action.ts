import { useAIPanel } from "@/contexts/ai-panel-context";

export function useAIAction() {
  const { selectAction, setResponse } = useAIPanel();

  const executeAction = async (
    action: "explain" | "generate",
    packageName: string,
    packageDescription?: string
  ) => {
    // Сначала выбираем действие (это покажет загрузку)
    selectAction(action);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          packageName,
          packageDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResponse(data.response, data.isDemo || false);
      } else {
        setResponse(
          "An error occurred while generating the response. Please try again.",
          true
        );
      }
    } catch (error) {
      console.error("AI API Error:", error);
      setResponse(
        "An error occurred while contacting the server. Please try again.",
        true
      );
    }
  };

  return { executeAction };
}
