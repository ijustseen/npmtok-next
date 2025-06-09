"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PackageCard } from "./package-card";
import { Loader2, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";

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
};

export function Feed() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const [nextSearchFrom, setNextSearchFrom] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(true);
  const router = useRouter();

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  const fetchPackages = useCallback(async () => {
    if (!shouldFetch || isFetching || !hasMore) return;

    setIsFetching(true);
    setLoading(true);

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
        return [...prev, ...uniqueNewPackages];
      });

      setNextSearchFrom(data.nextSearchFrom);

      if (newPackages.length === 0 || newPackages.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch packages", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsFetching(false);
      setShouldFetch(false);
    }
  }, [nextSearchFrom, hasMore, isFetching, shouldFetch]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const lastPackageElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setShouldFetch(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore]
  );

  return (
    <>
      <div className="h-screen w-screen overflow-y-auto snap-y snap-mandatory">
        {packages.map((pkg, index) => {
          const isLastElement = index === packages.length - 1;
          return (
            <div
              key={`${pkg.name}-${index}`}
              ref={isLastElement ? lastPackageElementRef : null}
              className="h-screen w-screen snap-start flex items-center justify-center pt-16"
            >
              <PackageCard package={pkg} onTagClick={handleTagClick} />
            </div>
          );
        })}
        {loading && (
          <div className="h-screen w-screen snap-start flex items-center justify-center">
            <Loader2 className="w-16 h-16 animate-spin" />
          </div>
        )}
        {!loading && !hasMore && packages.length > 0 && (
          <div className="h-screen w-screen snap-start flex items-center justify-center">
            <p className="text-gray-400">You&apos;ve reached the end!</p>
          </div>
        )}
      </div>
      {packages.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-gray-400 text-xs flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <ArrowDown className="w-4 h-4 animate-bounce" />
          <span>Scroll down or use ↑↓</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      )}
    </>
  );
}
