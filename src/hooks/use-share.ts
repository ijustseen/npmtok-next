import { useState, useEffect } from "react";

export function useShare() {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const share = async (title: string, text: string, url: string) => {
    if (!canShare) return;

    try {
      await navigator.share({
        title,
        text,
        url,
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  return {
    canShare,
    share,
  };
}
