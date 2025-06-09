"use client";

import {
  Star,
  Bookmark,
  Share2,
  ExternalLink,
  Clipboard,
  Download,
  GitFork,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import Link from "next/link";

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
  const { user, openLoginModal } = useAuth();

  const handleStar = () => {
    if (!user) {
      openLoginModal();
    } else {
      console.log("Starring package...");
    }
  };

  const handleSave = () => {
    if (!user) {
      openLoginModal();
    } else {
      console.log("Saving package...");
    }
  };

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
            <Link
              href={`https://github.com/${pkg.author}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${pkg.author}`}
                alt="Author avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            </Link>
            <div>
              <Link
                href={`https://github.com/${pkg.author}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <p className="text-sm hover:underline">@{pkg.author}</p>
              </Link>
              <p className="text-xs text-gray-500">v{pkg.version}</p>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 flex flex-col space-y-6">
          <button className="text-white" onClick={handleStar}>
            <Star className="w-8 h-8" />
          </button>
          <button className="text-white">
            <Bookmark className="w-8 h-8" onClick={handleSave} />
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
                <Clipboard className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
