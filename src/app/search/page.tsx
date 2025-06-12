"use client";

import { Header } from "@/components/header";
import { MainLayout } from "@/components/main-layout";
import { useSearchParams, useRouter } from "next/navigation";
import { PackageCard } from "@/components/package-card";
import { useState, useEffect, Suspense, useRef, useCallback } from "react";
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
  return (
    <Suspense
      fallback={
        <div className="bg-black text-white min-h-screen flex justify-center items-center">
          <Loader2 className="w-16 h-16 animate-spin" />
        </div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentFrom, setCurrentFrom] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  // Сброс состояния при изменении поискового запроса
  useEffect(() => {
    setResults([]);
    setCurrentFrom(0);
    setHasMore(true);
    setLoading(true);
  }, [query]);

  // Основная функция поиска
  const searchPackages = useCallback(
    async (
      searchQuery: string,
      from: number = 0,
      isLoadMore: boolean = false
    ) => {
      if (!searchQuery) {
        setResults([]);
        setLoading(false);
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(
          `/api/packages?q=${encodeURIComponent(
            searchQuery
          )}&size=24&from=${from}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        if (isLoadMore) {
          // Добавляем новые результаты к существующим
          setResults((prev) => [...prev, ...(data.packages || [])]);
        } else {
          // Заменяем результаты (новый поиск)
          setResults(data.packages || []);
        }

        setHasMore(data.hasMore || false);
        setCurrentFrom(data.nextFrom || from + 24);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        if (!isLoadMore) {
          setResults([]);
        }
        setHasMore(false);
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  // Первоначальный поиск при изменении запроса
  useEffect(() => {
    searchPackages(query, 0, false);
  }, [query, searchPackages]);

  // Функция для загрузки дополнительных результатов
  const loadMoreResults = useCallback(() => {
    if (!loadingMore && hasMore && query) {
      searchPackages(query, currentFrom, true);
    }
  }, [loadingMore, hasMore, query, currentFrom, searchPackages]);

  // Intersection Observer для отслеживания конца списка
  const lastPackageElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreResults();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, loadMoreResults]
  );

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <MainLayout>
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
          <>
            <div className="gap-8 [column-count:1] md:[column-count:2] lg:[column-count:3]">
              {results.length > 0
                ? results.map((pkg, index) => {
                    // Добавляем ref к предпоследнему элементу для триггера загрузки
                    const isTriggerElement = index === results.length - 3; // Триггер за 3 элемента до конца

                    return (
                      <div
                        key={pkg.name}
                        className="mb-8 break-inside-avoid"
                        ref={isTriggerElement ? lastPackageElementRef : null}
                      >
                        <PackageCard
                          package={pkg}
                          onTagClick={handleTagClick}
                          variant="small"
                        />
                      </div>
                    );
                  })
                : query && (
                    <div className="text-center col-span-full">
                      <p>No packages found for &quot;{query}&quot;.</p>
                    </div>
                  )}
            </div>

            {/* Индикатор загрузки дополнительных результатов */}
            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2 text-gray-400">
                  Loading more results...
                </span>
              </div>
            )}

            {/* Сообщение о том, что больше нет результатов */}
            {!hasMore && results.length > 0 && !loadingMore && (
              <div className="flex justify-center items-center py-8">
                <p className="text-gray-400">
                  You&apos;ve reached the end of search results!
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </MainLayout>
  );
}
