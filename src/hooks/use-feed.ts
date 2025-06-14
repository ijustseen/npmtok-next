import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package } from "@/types";

export function useFeed() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextSearchFrom, setNextSearchFrom] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const refresh = searchParams.get("refresh");
    if (refresh) {
      setPackages([]);
      setNextSearchFrom(0);
      setHasMore(true);
      setLoading(true);
      router.replace("/feed", { scroll: false });
    }
  }, [searchParams, router]);

  const fetchPackages = useCallback(
    async (isLoadMore: boolean = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(
          `/api/packages?size=10&searchFrom=${nextSearchFrom}`
        );
        if (!response.ok) {
          console.error("Failed to fetch packages", response.statusText);
          setHasMore(false);
          return;
        }

        const data = await response.json();
        const newPackages: Package[] = data.packages;

        if (!Array.isArray(newPackages)) {
          console.error("API did not return an array of packages", data);
          setHasMore(false);
          return;
        }

        setPackages((prev) => {
          const existingNames = new Set(prev.map((p) => p.name));
          const uniqueNewPackages = newPackages.filter(
            (p) => !existingNames.has(p.name)
          );
          if (isLoadMore) {
            return [...prev, ...uniqueNewPackages];
          } else {
            return uniqueNewPackages;
          }
        });

        setNextSearchFrom(data.nextSearchFrom);

        if (newPackages.length === 0 || newPackages.length < 10) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch packages", error);
        setHasMore(false);
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [nextSearchFrom]
  );

  useEffect(() => {
    if (packages.length === 0 && hasMore) {
      fetchPackages(false);
    }
  }, [packages.length, hasMore, fetchPackages]);

  const loadMorePackages = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPackages(true);
    }
  }, [loadingMore, hasMore, fetchPackages]);

  const loadMorePackagesRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePackages();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, loadMorePackages]
  );

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return {
    packages,
    loading,
    loadingMore,
    hasMore,
    loadMorePackagesRef,
    handleTagClick,
  };
}
