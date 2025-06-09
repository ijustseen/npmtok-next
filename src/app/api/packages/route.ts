import { NextResponse } from "next/server";

type NpmsSearchResult = {
  results: {
    package: {
      name: string;
    };
  }[];
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchFrom = parseInt(searchParams.get("searchFrom") || "0", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);

  const collectedPackages: Package[] = [];
  const searchBatchSize = 250; // How many to fetch from npms.io at a time. Max is 250.
  let attempts = 0;
  const maxAttempts = 10;

  try {
    const countResponse = await fetch(
      `https://api.npms.io/v2/search?q=not:deprecated+not:insecure&size=1`
    );
    if (!countResponse.ok) {
      throw new Error(
        `Failed to get total package count: ${countResponse.statusText}`
      );
    }
    const { total: totalPackages } = await countResponse.json();
    const maxApiFrom = 10000; // npms.io API limit for 'from' parameter

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
        const errorText = await searchResponse.text();
        console.error("Failed to fetch from npms.io search:", errorText);
        continue;
      }

      const searchResult: NpmsSearchResult = await searchResponse.json();
      const rawPackages = searchResult.results;

      if (rawPackages.length === 0) {
        continue;
      }

      const packageNames = rawPackages.map((r) => r.package.name);
      const packageDetailsPromises = packageNames.map((name: string) =>
        fetch(
          `https://api.npms.io/v2/package/${encodeURIComponent(name)}`
        ).then((res) => {
          if (!res.ok) {
            return null;
          }
          return res.json();
        })
      );

      const packageDetailsResults = await Promise.all(packageDetailsPromises);

      for (let i = 0; i < packageDetailsResults.length; i++) {
        const pkg = packageDetailsResults[i] as NpmsPackage | null;

        const isValid = !!(
          pkg &&
          pkg.collected &&
          pkg.collected.npm &&
          pkg.collected.npm.downloads &&
          pkg.collected.npm.downloads.length > 0
        );

        if (isValid) {
          const weeklyDownloads =
            pkg.collected.npm!.downloads.find(
              (d: { from: string; to: string; count: number }) => {
                const fromDate = new Date(d.from);
                const toDate = new Date(d.to);
                const diffDays = Math.round(
                  (toDate.getTime() - fromDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return diffDays >= 6 && diffDays <= 8;
              }
            )?.count ||
            pkg.collected.npm!.downloads[1]?.count ||
            0;

          let authorHandle = "N/A";
          let repository: { owner: string; name: string } | null = null;
          const repoUrl = pkg.collected.metadata.links.repository;
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

          collectedPackages.push({
            name: pkg.collected.metadata.name,
            description: pkg.collected.metadata.description,
            author: authorHandle,
            version: `v${pkg.collected.metadata.version}`,
            tags: pkg.collected.metadata.keywords || [],
            stats: {
              downloads: formatNumber(weeklyDownloads),
              stars: formatNumber(pkg.collected.github?.starsCount || 0),
              forks: formatNumber(pkg.collected.github?.forksCount || 0),
            },
            time: formatTime(pkg.collected.metadata.date),
            repository,
            npmLink: pkg.collected.metadata.links.npm,
          });
        }

        if (collectedPackages.length >= size) {
          break;
        }
      }
    }

    return NextResponse.json({
      packages: collectedPackages.slice(0, size),
      nextSearchFrom: searchFrom + collectedPackages.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return new NextResponse(
        JSON.stringify({
          error: error.message,
          packages: [],
          nextSearchFrom: searchFrom,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
