"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { PackageCard } from "@/components/package-card";
import { Header } from "@/components/header";
import { MainLayout } from "@/components/main-layout";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function SavedPackagesPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="bg-black text-white min-h-screen flex justify-center items-center">
          <Loader2 className="w-16 h-16 animate-spin" />
        </div>
      }
    >
      <SavedPackagesPage />
    </Suspense>
  );
}

function SavedPackagesPage() {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarkedPackages, setBookmarkedPackages] = useState<
    BookmarkedPackage[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchBookmarkedPackages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookmarked_packages")
        .select("package")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching bookmarked packages:", error);
      } else {
        setBookmarkedPackages(data as BookmarkedPackage[]);
      }
      setLoading(false);
    };

    fetchBookmarkedPackages();
  }, [user, supabase, router]);

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

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

  type BookmarkedPackage = {
    package: Package;
  };

  if (loading) {
    return (
      <MainLayout>
        <Header />
        <div className="container bg-black mx-auto py-10 pt-20">
          <h1 className="text-4xl font-bold mb-8">Your Saved Packages</h1>
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header />
      <div className="container bg-black mx-auto py-10 pt-20">
        <h1 className="text-4xl font-bold mb-8">Your Saved Packages</h1>
        {bookmarkedPackages && bookmarkedPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarkedPackages.map(
              (item: BookmarkedPackage, index: number) => (
                <div key={index} className="h-full flex">
                  <PackageCard
                    package={{ ...item.package, isBookmarked: true }}
                    onTagClick={handleTagClick}
                    variant="small"
                    className="h-full flex justify-center items-stretch"
                  />
                </div>
              )
            )}
          </div>
        ) : (
          <p>You haven&apos;t saved any packages yet.</p>
        )}
      </div>
    </MainLayout>
  );
}
