import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type NpmsSearchResult = {
  results: {
    package: {
      name: string;
    };
  }[];
  total: number;
};

type NpmsPackage = {
  collected: {
    metadata: {
      name: string;
      description: string;
      version: string;
      date: string;
      author?: { name: string };
      publisher?: { username: string };
      links: { repository?: string; npm: string };
      keywords?: string[];
    };
    github?: {
      starsCount: number;
      forksCount: number;
      homepage?: string;
    };
    npm?: {
      downloads: { from: string; to: string; count: number }[];
    };
  };
};

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
  isBookmarked: boolean;
};

function formatNumber(num: number): string {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 365) {
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }
  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return "today";
}

async function transformNpmsPackage(
  pkg: NpmsPackage | null,
  bookmarkedPackagesSet: Set<string>
): Promise<Package | null> {
  const isValid = !!(
    pkg &&
    pkg.collected &&
    pkg.collected.npm &&
    pkg.collected.npm.downloads &&
    pkg.collected.npm.downloads.length > 0
  );

  if (!isValid || !pkg) return null;

  const weeklyDownloads =
    pkg.collected.npm!.downloads.find(
      (d: { from: string; to: string; count: number }) => {
        const fromDate = new Date(d.from);
        const toDate = new Date(d.to);
        const diffDays = Math.round(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays >= 6 && diffDays <= 8;
      }
    )?.count ||
    pkg.collected.npm!.downloads[1]?.count ||
    0;

  let authorHandle = "N/A";
  let repository: { owner: string; name: string } | null = null;
  const repoUrl =
    pkg.collected.metadata.links.repository || pkg.collected.github?.homepage;
  if (repoUrl) {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      authorHandle = match[1];
      repository = {
        owner: match[1],
        name: match[2].replace(/\.git$/, "").replace(/\.js$/, ""),
      };
    }
  } else if (pkg.collected.metadata.publisher?.username) {
    authorHandle = pkg.collected.metadata.publisher.username;
  } else if (pkg.collected.metadata.author?.name) {
    authorHandle = pkg.collected.metadata.author.name
      .replace(/\s/g, "-")
      .toLowerCase();
  }

  const packageName = pkg.collected.metadata.name;
  let starsCount = pkg.collected.github?.starsCount || 0;
  let forksCount = pkg.collected.github?.forksCount || 0;

  if (!pkg.collected.github && repository) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repository.owner}/${repository.name}`,
        {
          headers: {
            ...(process.env.GITHUB_TOKEN
              ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
              : {}),
          },
        }
      );
      if (res.ok) {
        const repoData = await res.json();
        starsCount = repoData.stargazers_count;
        forksCount = repoData.forks_count;
      }
    } catch (error) {
      console.error(
        `Failed to fetch github data for ${repository.owner}/${repository.name}`,
        error
      );
    }
  }

  return {
    name: packageName,
    description: pkg.collected.metadata.description,
    author: authorHandle,
    version: `v${pkg.collected.metadata.version}`,
    tags: pkg.collected.metadata.keywords || [],
    stats: {
      downloads: formatNumber(weeklyDownloads),
      stars: formatNumber(starsCount),
      forks: formatNumber(forksCount),
    },
    time: formatTime(pkg.collected.metadata.date),
    repository,
    npmLink: pkg.collected.metadata.links.npm,
    isBookmarked: bookmarkedPackagesSet.has(packageName),
  };
}

async function getTransformedPackages(
  packageNames: string[],
  bookmarkedPackagesSet: Set<string>
): Promise<Package[]> {
  const packageDetailsPromises = packageNames.map((name: string) =>
    fetch(`https://api.npms.io/v2/package/${encodeURIComponent(name)}`).then(
      (res) => (res.ok ? res.json() : null)
    )
  );
  const packageDetailsResults = await Promise.all(packageDetailsPromises);

  const transformedPackages = await Promise.all(
    packageDetailsResults.map((p) =>
      transformNpmsPackage(p, bookmarkedPackagesSet)
    )
  );

  return transformedPackages.filter((p): p is Package => p !== null);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const size = parseInt(searchParams.get("size") || "10", 10);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let bookmarkedPackagesSet = new Set<string>();

    if (user) {
      const { data: bookmarkedPackages } = await supabase
        .from("bookmarked_packages")
        .select("package->>name")
        .eq("user_id", user.id);

      if (bookmarkedPackages) {
        bookmarkedPackagesSet = new Set(
          bookmarkedPackages.map((p: { name: string }) => p.name)
        );
      }
    }

    if (query) {
      // --- SEARCH LOGIC ---
      const searchResponse = await fetch(
        `https://api.npms.io/v2/search?q=${encodeURIComponent(
          query
        )}&size=${size}`
      );
      if (!searchResponse.ok) {
        throw new Error(
          `Failed to search packages: ${searchResponse.statusText}`
        );
      }
      const searchResult: NpmsSearchResult = await searchResponse.json();
      const rawPackages = searchResult.results;

      const packageNames = rawPackages.map((r) => r.package.name);
      const collectedPackages = await getTransformedPackages(
        packageNames,
        bookmarkedPackagesSet
      );

      return NextResponse.json({
        packages: collectedPackages,
        nextSearchFrom: 0, // Not applicable for search
      });
    } else {
      // --- FEED LOGIC (OPTIMIZED) ---
      const searchFrom = parseInt(searchParams.get("searchFrom") || "0", 10);
      const collectedPackages: Package[] = [];
      const searchBatchSize = 250;
      let attempts = 0;
      const maxAttempts = 10;

      const countResponse = await fetch(
        `https://api.npms.io/v2/search?q=not:deprecated+not:insecure&size=1`
      );
      if (!countResponse.ok) {
        throw new Error(
          `Failed to get total package count: ${countResponse.statusText}`
        );
      }
      const { total: totalPackages } = await countResponse.json();
      const maxApiFrom = 10000;

      while (collectedPackages.length < size && attempts < maxAttempts) {
        attempts++;
        const searchSpace = Math.min(totalPackages, maxApiFrom);
        const randomFrom =
          searchSpace > searchBatchSize
            ? Math.floor(Math.random() * (searchSpace - searchBatchSize))
            : 0;

        const searchResponse = await fetch(
          `https://api.npms.io/v2/search?q=not:deprecated+not:insecure&size=${searchBatchSize}&from=${randomFrom}`
        );

        if (!searchResponse.ok) {
          console.error(
            "Failed to fetch from npms.io search:",
            await searchResponse.text()
          );
          continue;
        }

        const searchResult: NpmsSearchResult = await searchResponse.json();
        if (searchResult.results.length === 0) {
          continue;
        }

        const packageNames = searchResult.results.map((r) => r.package.name);
        const newPackages = await getTransformedPackages(
          packageNames,
          bookmarkedPackagesSet
        );

        const existingNames = new Set(collectedPackages.map((p) => p.name));
        const uniqueNewPackages = newPackages.filter(
          (p) => !existingNames.has(p.name)
        );

        collectedPackages.push(...uniqueNewPackages);
      }

      const finalPackages = collectedPackages.slice(0, size);

      return NextResponse.json({
        packages: finalPackages,
        nextSearchFrom: searchFrom + finalPackages.length,
      });
    }
  } catch (error) {
    console.error("Error in GET /api/packages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
