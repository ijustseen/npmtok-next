import { Header } from "@/components/header";
import { PackageCard } from "@/components/package-card";
import { ArrowDown } from "lucide-react";

const mockPackage = {
  name: "react-icons",
  description: "SVG React icons of popular icon packs using ES6 imports",
  author: "Goran Gajic",
  version: "v5.5.0",
  stats: {
    downloads: "14.8M",
    stars: "12.1K",
    forks: "776",
  },
  time: "4 months ago",
};

export default function FeedPage() {
  return (
    <main className="bg-black text-white">
      <Header />
      <div className="h-screen w-screen overflow-y-auto snap-y snap-mandatory">
        <div className="h-screen w-screen snap-start flex items-center justify-center pt-16">
          <PackageCard package={mockPackage} />
        </div>
        <div className="h-screen w-screen snap-start flex items-center justify-center pt-16">
          <PackageCard
            package={{
              ...mockPackage,
              name: "clsx",
              description:
                "A tiny (239B) utility for constructing `className` strings conditionally.",
              author: "Luke Edwards",
              version: "2.1.1",
              stats: { downloads: "111.4M", stars: "22k", forks: "401" },
              time: "1 month ago",
            }}
          />
        </div>
      </div>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-gray-400 text-xs flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <ArrowDown className="w-4 h-4 animate-bounce" />
        <span>Scroll down or use ↑↓</span>
      </div>
    </main>
  );
}
