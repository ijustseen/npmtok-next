"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PackageCard } from "./package-card";
import { Loader2, ArrowDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Package = {
  name: string;
  description: string;
  author: string;
  version: string;
  stats: {
    downloads: string;
    stars: string;
    forks: string;
  };
  time: string;
  repository: {
    owner: string;
    name: string;
  } | null;
  tags: string[];
  npmLink: string;
  isBookmarked?: boolean;
};

export function Feed() {
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

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

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

  return (
    <>
      <div className="h-screen w-screen overflow-y-auto snap-y snap-mandatory">
        {packages.map((pkg, index) => {
          const isTriggerElement = index === packages.length - 3;
          return (
            <div
              key={pkg.name}
              ref={isTriggerElement ? loadMorePackagesRef : null}
              className="h-screen w-screen snap-start flex items-center justify-center pt-16 optimized-card"
            >
              <PackageCard package={pkg} onTagClick={handleTagClick} />
            </div>
          );
        })}
        {loading && packages.length === 0 && (
          <div className="h-screen w-screen snap-start flex items-center justify-center">
            <Loader2 className="w-16 h-16 animate-spin" />
          </div>
        )}
        {loadingMore && (
          <div className="h-screen w-screen snap-start flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-3 text-gray-400">Loading more packages...</span>
          </div>
        )}
        {!loading && !loadingMore && !hasMore && packages.length > 0 && (
          <div className="h-screen w-screen snap-start flex items-center justify-center">
            <p className="text-gray-400">You&apos;ve reached the end!</p>
          </div>
        )}
      </div>
      {packages.length > 0 && !loading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-gray-400 text-xs flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <ArrowDown className="w-4 h-4 animate-bounce" />
          <span>Scroll down or use ↑↓</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      )}
    </>
  );
}
