import { useState } from "react";

export function useCopy() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Could not copy text:", error);
    }
  };

  return {
    isCopied,
    copyToClipboard,
  };
}
