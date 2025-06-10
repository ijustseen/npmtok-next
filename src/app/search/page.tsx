"use client";

import { Header } from "@/components/header";
import { useSearchParams, useRouter } from "next/navigation";
import { PackageCard } from "@/components/package-card";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

type Package = {
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
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
  npmLink: string;
  isBookmarked?: boolean;
};

export default function SearchPageWrapper() {
  return <SearchPage />;
}

function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function doSearch() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `/api/packages?q=${encodeURIComponent(query)}&size=24`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setResults(data.packages || []);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    doSearch();
  }, [query]);

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto bg-black px-4 pt-24 min-h-screen flex flex-col">
        {query && (
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            Search results for: <span className="text-pink-500">{query}</span>
          </h1>
        )}
        {loading ? (
          <div className="flex-grow flex justify-center items-center">
            <Loader2 className="w-16 h-16 animate-spin" />
          </div>
        ) : (
          <div className="gap-8 [column-count:1] md:[column-count:2] lg:[column-count:3]">
            {results.length > 0
              ? results.map((pkg) => (
                  <div key={pkg.name} className="mb-8 break-inside-avoid">
                    <PackageCard
                      package={pkg}
                      onTagClick={handleTagClick}
                      variant="small"
                    />
                  </div>
                ))
              : query && (
                  <div className="text-center col-span-full">
                    <p>No packages found for &quot;{query}&quot;.</p>
                  </div>
                )}
          </div>
        )}
      </main>
    </>
  );
}
