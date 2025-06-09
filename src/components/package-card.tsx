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
import { useState, useEffect } from "react";

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
  const [isStarred, setIsStarred] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      if (!user) return;

      const response = await fetch(
        `/api/bookmarks?packageName=${encodeURIComponent(pkg.name)}`
      );
      const data = await response.json();

      if (response.ok && data.isBookmarked) {
        setIsBookmarked(true);
      } else {
        setIsBookmarked(false);
      }
    };

    if (user) {
      checkBookmark();
    }
  }, [user, pkg.name]);

  const handleStar = () => {
    if (!user) {
      openLoginModal();
    } else {
      setIsStarred(!isStarred);
    }
  };

  const handleSave = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (isBookmarked) {
      // Delete bookmark
      const response = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageName: pkg.name }),
      });

      if (response.ok) {
        setIsBookmarked(false);
      } else {
        console.error("Error removing bookmark");
      }
    } else {
      // Add bookmark
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pkg),
      });

      if (response.ok) {
        setIsBookmarked(true);
      } else {
        console.error("Error adding bookmark");
      }
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
          <button
            className={`transition-all active:scale-90 ${
              isStarred ? "text-yellow-400" : "text-white hover:text-yellow-400"
            }`}
            onClick={handleStar}
          >
            <Star
              className="w-8 h-8"
              fill={isStarred ? "currentColor" : "none"}
            />
          </button>
          <button
            className={`transition-all active:scale-90 ${
              isBookmarked
                ? "text-orange-500"
                : "text-white hover:text-orange-500"
            }`}
            onClick={handleSave}
          >
            <Bookmark
              className="w-8 h-8"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
          <button className="text-white transition-all hover:text-blue-500 active:scale-90">
            <Share2 className="w-8 h-8" />
          </button>
          <button className="text-white transition-all hover:text-teal-400 active:scale-90">
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
