import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PackageCard } from "@/components/package-card";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default async function SavedPackagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: bookmarkedPackages, error } = await supabase
    .from("bookmarked_packages")
    .select("package")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching bookmarked packages:", error);
    // TODO: Handle error state more gracefully
    return <p>Error loading saved packages.</p>;
  }

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
  };

  type BookmarkedPackage = {
    package: Package;
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-10 pt-20">
        <h1 className="text-4xl font-bold mb-8">Your Saved Packages</h1>
        {bookmarkedPackages && bookmarkedPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarkedPackages.map(
              (item: BookmarkedPackage, index: number) => (
                <PackageCard key={index} package={item.package} />
              )
            )}
          </div>
        ) : (
          <p>You haven&apos;t saved any packages yet.</p>
        )}
      </div>
    </>
  );
}
