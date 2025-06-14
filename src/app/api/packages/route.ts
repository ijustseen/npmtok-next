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

type NpmPackage = {
  name: string;
  description: string;
  version: string;
  keywords?: string[];
  author?: { name: string } | string;
  maintainers?: { name: string; email: string }[];
  repository?: { url: string; type: string };
  homepage?: string;
  time: Record<string, string>;
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

// Transform NPM Registry package to our format
async function transformNpmPackage(
  pkg: NpmPackage,
  bookmarkedPackagesSet: Set<string>
): Promise<Package | null> {
  if (!pkg) return null;

  let authorHandle = "N/A";
  let repository: { owner: string; name: string } | null = null;

  // Parse repository info
  const repoUrl = pkg.repository?.url || pkg.homepage;
  if (repoUrl) {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      authorHandle = match[1];
      repository = {
        owner: match[1],
        name: match[2].replace(/\.git$/, "").replace(/\.js$/, ""),
      };
    }
  }

  // Fallback author detection
  if (authorHandle === "N/A") {
    if (typeof pkg.author === "object" && pkg.author?.name) {
      authorHandle = pkg.author.name.replace(/\s/g, "-").toLowerCase();
    } else if (typeof pkg.author === "string") {
      authorHandle = pkg.author.replace(/\s/g, "-").toLowerCase();
    } else if (pkg.maintainers && pkg.maintainers.length > 0) {
      authorHandle = pkg.maintainers[0].name;
    }
  }

  // Get latest version time
  const versions = Object.keys(pkg.time).filter(
    (v) => v !== "created" && v !== "modified"
  );
  const latestVersion = versions[versions.length - 1] || pkg.version;
  const timeString =
    pkg.time[latestVersion] || pkg.time.modified || pkg.time.created;

  // Try to get GitHub stats if repository exists
  let starsCount = 0;
  let forksCount = 0;
  if (repository) {
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
        starsCount = repoData.stargazers_count || 0;
        forksCount = repoData.forks_count || 0;
      }
    } catch (error) {
      console.error(
        `Failed to fetch github data for ${repository.owner}/${repository.name}`,
        error
      );
    }
  }

  return {
    name: pkg.name,
    description: pkg.description || "No description available",
    author: authorHandle,
    version: `v${pkg.version}`,
    tags: pkg.keywords || [],
    stats: {
      downloads: "0", // NPM Registry doesn't provide download stats
      stars: formatNumber(starsCount),
      forks: formatNumber(forksCount),
    },
    time: formatTime(timeString),
    repository,
    npmLink: `https://www.npmjs.com/package/${pkg.name}`,
    isBookmarked: bookmarkedPackagesSet.has(pkg.name),
  };
}

async function searchNpmRegistry(
  query: string,
  size: number = 10,
  from: number = 0
): Promise<{ packages: string[]; total: number }> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(
        query
      )}&size=${size}&from=${from}`
    );
    if (!response.ok) return { packages: [], total: 0 };

    const data = await response.json();
    return {
      packages:
        data.objects?.map(
          (obj: { package: { name: string } }) => obj.package.name
        ) || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Failed to search NPM registry:", error);
    return { packages: [], total: 0 };
  }
}

async function getPackageFromNpmRegistry(
  packageName: string
): Promise<NpmPackage | null> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    const latestVersion = data["dist-tags"]?.latest;
    if (!latestVersion || !data.versions?.[latestVersion]) return null;

    const versionData = data.versions[latestVersion];
    return {
      name: data.name,
      description: versionData.description,
      version: latestVersion,
      keywords: versionData.keywords,
      author: versionData.author,
      maintainers: data.maintainers,
      repository: versionData.repository,
      homepage: versionData.homepage,
      time: data.time,
    };
  } catch (error) {
    console.error(
      `Failed to fetch package ${packageName} from NPM registry:`,
      error
    );
    return null;
  }
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
  const packageDetailsPromises = packageNames.map(
    (name: string, index: number) =>
      fetch(`https://api.npms.io/v2/package/${encodeURIComponent(name)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => ({ data, index }))
  );
  const packageDetailsResults = await Promise.all(packageDetailsPromises);

  // Сортируем по исходному индексу для сохранения порядка
  packageDetailsResults.sort((a, b) => a.index - b.index);

  const transformedPackages = await Promise.all(
    packageDetailsResults.map(({ data }) =>
      transformNpmsPackage(data, bookmarkedPackagesSet)
    )
  );

  return transformedPackages.filter((p): p is Package => p !== null);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const size = parseInt(searchParams.get("size") || "10", 10);
  const from = parseInt(searchParams.get("from") || "0", 10);

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
      // --- SEARCH LOGIC WITH FALLBACK ---
      const searchResponse = await fetch(
        `https://api.npms.io/v2/search?q=${encodeURIComponent(
          query
        )}&size=${size}&from=${from}`
      );
      if (!searchResponse.ok) {
        throw new Error(
          `Failed to search packages: ${searchResponse.statusText}`
        );
      }
      const searchResult: NpmsSearchResult = await searchResponse.json();
      let collectedPackages: Package[] = [];
      let npmResult: { packages: string[]; total: number } = {
        packages: [],
        total: 0,
      };

      if (searchResult.results.length > 0) {
        // Use NPMS.io results if found
        const packageNames = searchResult.results.map((r) => r.package.name);
        collectedPackages = await getTransformedPackages(
          packageNames,
          bookmarkedPackagesSet
        );
      } else {
        // Fallback to NPM Registry search
        npmResult = await searchNpmRegistry(query, size, from);

        if (npmResult.packages.length > 0) {
          const npmPackagePromises = npmResult.packages.map((name, index) =>
            getPackageFromNpmRegistry(name).then((data) => ({ data, index }))
          );
          const npmPackages = await Promise.all(npmPackagePromises);

          // Сортируем по исходному индексу для сохранения порядка
          npmPackages.sort((a, b) => a.index - b.index);

          const transformedNpmPackages = await Promise.all(
            npmPackages.map(({ data }) =>
              data ? transformNpmPackage(data, bookmarkedPackagesSet) : null
            )
          );

          collectedPackages = transformedNpmPackages.filter(
            (p): p is Package => p !== null
          );
        }
      }

      return NextResponse.json({
        packages: collectedPackages,
        total: searchResult.total || collectedPackages.length,
        hasMore:
          searchResult.results.length > 0
            ? from + size < searchResult.total
            : from + size < npmResult.total,
        nextFrom: from + size,
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
