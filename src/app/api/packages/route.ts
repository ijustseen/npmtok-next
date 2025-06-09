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
  let currentSearchFrom = searchFrom;
  const searchBatchSize = 25; // How many to fetch from npms.io at a time

  try {
    while (collectedPackages.length < size) {
      const searchResponse = await fetch(
        `https://api.npms.io/v2/search?q=not:deprecated+not:insecure&size=${searchBatchSize}&from=${currentSearchFrom}`
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("Failed to fetch from npms.io search:", errorText);
        throw new Error(
          `Failed to fetch from npms.io search: ${searchResponse.statusText}`
        );
      }

      const searchResult: NpmsSearchResult = await searchResponse.json();
      const rawPackages = searchResult.results;

      if (rawPackages.length === 0) {
        // No more packages from the source, break the loop
        break;
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
            stats: {
              downloads: formatNumber(weeklyDownloads),
              stars: formatNumber(pkg.collected.github?.starsCount || 0),
              forks: formatNumber(pkg.collected.github?.forksCount || 0),
            },
            time: formatTime(pkg.collected.metadata.date),
            repository,
          });
        }

        if (collectedPackages.length >= size) {
          const nextSearchFrom = currentSearchFrom + i + 1;
          return NextResponse.json({
            packages: collectedPackages,
            nextSearchFrom,
          });
        }
      }

      currentSearchFrom += rawPackages.length;

      if (rawPackages.length < searchBatchSize) {
        break;
      }
    }

    return NextResponse.json({
      packages: collectedPackages,
      nextSearchFrom: currentSearchFrom,
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
