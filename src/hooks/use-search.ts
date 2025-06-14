import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const performSearch = (query?: string) => {
    const finalQuery = query || searchQuery;
    if (finalQuery.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    performSearch,
    handleKeyDown,
  };
}
