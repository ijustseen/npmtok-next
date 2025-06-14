import { Download, Star, GitFork } from "lucide-react";

interface PackageStatsProps {
  stats: {
    downloads: string;
    stars: string;
    forks: string;
  };
}

export function PackageStats({ stats }: PackageStatsProps) {
  return (
    <div className="flex items-center space-x-6 text-gray-400 mb-6">
      <div className="flex items-center space-x-2">
        <Download className="w-5 h-5" />
        <span>{stats.downloads} Weekly</span>
      </div>
      <div className="flex items-center space-x-2">
        <Star className="w-5 h-5" />
        <span>{stats.stars} Stars</span>
      </div>
      <div className="flex items-center space-x-2">
        <GitFork className="w-5 h-5" />
        <span>{stats.forks} Forks</span>
      </div>
    </div>
  );
}
