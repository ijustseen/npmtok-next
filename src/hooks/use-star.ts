import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Repository } from "@/types";

export function useStar(repository: Repository | null) {
  const { user, session, openLoginModal } = useAuth();
  const [isStarred, setIsStarred] = useState(false);
  const [isStarring, setIsStarring] = useState(false);

  useEffect(() => {
    const checkStarred = async () => {
      if (!user || !session?.provider_token || !repository) return;

      const { owner, name: repo } = repository;
      const response = await fetch(
        `/api/star?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(
          repo
        )}`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setIsStarred(data.isStarred);
      } else {
        setIsStarred(false);
      }
    };

    if (user) {
      checkStarred();
    }
  }, [user, session, repository]);

  const toggleStar = async () => {
    if (!user || !session?.provider_token) {
      openLoginModal();
      return;
    }

    if (!repository) {
      console.error("Repository information is not available");
      return;
    }

    setIsStarring(true);
    const { owner, name: repo } = repository;

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.provider_token}`,
      };

      const response = await fetch("/api/star", {
        method: isStarred ? "DELETE" : "POST",
        headers: headers,
        body: JSON.stringify({ owner, repo }),
      });

      if (response.ok) {
        setIsStarred(!isStarred);
      } else {
        console.error(
          `Error ${isStarred ? "unstarring" : "starring"} repository`
        );
      }
    } catch (error) {
      console.error("Failed to star/unstar:", error);
    } finally {
      setIsStarring(false);
    }
  };

  return {
    isStarred,
    isStarring,
    toggleStar,
  };
}
