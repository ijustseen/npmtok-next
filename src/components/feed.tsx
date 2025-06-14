"use client";

import { PackageCard } from "./package-card";
import { ArrowDown } from "lucide-react";
import { useFeed } from "@/hooks/use-feed";
import { LoadingIndicator } from "./ui/loading-indicator";

export function Feed() {
  const {
    packages,
    loading,
    loadingMore,
    hasMore,
    loadMorePackagesRef,
    handleTagClick,
  } = useFeed();

  return (
    <>
      <div className="h-screen w-screen overflow-y-auto snap-y snap-mandatory">
        {packages.map((pkg, index) => {
          const isTriggerElement = index === packages.length - 3;
          return (
            <div
              key={pkg.name}
              ref={isTriggerElement ? loadMorePackagesRef : null}
              className="h-screen w-screen snap-start flex items-center justify-center optimized-card" //pt-16
            >
              <PackageCard package={pkg} onTagClick={handleTagClick} />
            </div>
          );
        })}

        {loading && packages.length === 0 && (
          <div className="h-screen w-screen snap-start flex items-center justify-center">
            <LoadingIndicator size="lg" />
          </div>
        )}

        {loadingMore && (
          <div className="h-screen w-screen snap-start flex items-center justify-center">
            <LoadingIndicator text="Loading more packages..." />
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
