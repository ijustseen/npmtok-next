import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export function useBookmark(
  packageName: string,
  initialIsBookmarked: boolean = false
) {
  const { user, openLoginModal } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isSaving, setIsSaving] = useState(false);

  const toggleBookmark = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageName }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      } else {
        console.error(`Error ${isBookmarked ? "removing" : "adding"} bookmark`);
      }
    } catch (error) {
      console.error("Failed to save/remove bookmark:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isBookmarked,
    isSaving,
    toggleBookmark,
  };
}
