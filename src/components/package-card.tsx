import {
  Star,
  Bookmark,
  Share2,
  ExternalLink,
  Download,
  GitFork,
} from "lucide-react";

type PackageCardProps = {
  package: {
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
  };
};

export function PackageCard({ package: pkg }: PackageCardProps) {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-[#121212] rounded-lg shadow-lg text-white w-full max-w-md mx-auto relative p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">Library</span>
          <span className="text-sm text-gray-400">x {pkg.time}</span>
        </div>

        <h2 className="text-4xl font-bold mb-2">{pkg.name}</h2>
        <p className="text-gray-400 mb-6">{pkg.description}</p>

        <div className="flex items-center space-x-6 text-gray-400 mb-6">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>{pkg.stats.downloads} Weekly</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>{pkg.stats.stars} Stars</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5" />
            <span>{pkg.stats.forks} Forks</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <img
              src="https://api.dicebear.com/8.x/pixel-art/svg?seed=gajic"
              alt="Author avatar"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm">@{pkg.author}</p>
              <p className="text-xs text-gray-500">v{pkg.version}</p>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 flex flex-col space-y-6">
          <button className="text-white">
            <Star className="w-8 h-8" />
          </button>
          <button className="text-white">
            <Bookmark className="w-8 h-8" />
          </button>
          <button className="text-white">
            <Share2 className="w-8 h-8" />
          </button>
          <button className="text-white">
            <ExternalLink className="w-8 h-8" />
          </button>
        </div>

        <div className="mt-6">
          <div className="bg-gray-900 rounded-md p-3 flex justify-between items-center">
            <code className="text-sm text-green-400">
              npm install {pkg.name}
            </code>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-white">
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
