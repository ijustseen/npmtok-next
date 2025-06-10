"use client";

import {
  Star,
  Bookmark,
  Share2,
  ExternalLink,
  Clipboard,
  Download,
  GitFork,
  Check,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ReadmeModal } from "./readme-modal";

type PackageCardProps = {
  package: {
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
    isBookmarked?: boolean;
  };
  onTagClick?: (tag: string) => void;
  variant?: "default" | "small";
};

export function PackageCard({
  package: pkg,
  onTagClick,
  variant = "default",
}: PackageCardProps) {
  const { user, session, openLoginModal } = useAuth();
  const [isStarred, setIsStarred] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(pkg.isBookmarked || false);
  const [isStarring, setIsStarring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    const checkStarred = async () => {
      if (!user || !session?.provider_token || !pkg.repository) return;

      const { owner, name: repo } = pkg.repository;
      const response = await fetch(
        `/api/star?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(
          repo
        )}`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setIsStarred(data.isStarred);
      } else {
        setIsStarred(false);
      }
    };

    if (user) {
      checkStarred();
    }
  }, [user, session, pkg.repository]);

  const handleStar = async () => {
    if (!user || !session?.provider_token) {
      openLoginModal();
      return;
    }

    if (!pkg.repository) {
      console.error("Repository information is not available");
      // Maybe show a toast message to the user
      return;
    }

    setIsStarring(true);
    const { owner, name: repo } = pkg.repository;

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.provider_token}`,
      };

      if (isStarred) {
        // Unstar
        const response = await fetch("/api/star", {
          method: "DELETE",
          headers: headers,
          body: JSON.stringify({ owner, repo }),
        });

        if (response.ok) {
          setIsStarred(false);
        } else {
          console.error("Error unstarring repository");
        }
      } else {
        // Star
        const response = await fetch("/api/star", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ owner, repo }),
        });

        if (response.ok) {
          setIsStarred(true);
        } else {
          console.error("Error starring repository");
        }
      }
    } catch (error) {
      console.error("Failed to star/unstar:", error);
    } finally {
      setIsStarring(false);
    }
  };

  const handleShare = async () => {
    if (!canShare) return;
    const shareUrl = `${window.location.origin}/search?q=${encodeURIComponent(
      pkg.name
    )}`;
    try {
      await navigator.share({
        title: `Check out ${pkg.name} on NpmTok`,
        text: pkg.description,
        url: shareUrl,
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const handleCopyCommand = () => {
    const command = `npm install ${pkg.name}`;
    navigator.clipboard.writeText(command).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const handleSave = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    setIsSaving(true);
    try {
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
    } catch (error) {
      console.error("Failed to save/unsave:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const DESCRIPTION_TRUNCATE_LENGTH = 150;
  const isLongDescription =
    pkg.description && pkg.description.length > DESCRIPTION_TRUNCATE_LENGTH;

  const ActionButtons = ({ iconSize }: { iconSize: string }) => (
    <>
      {pkg.repository && (
        <button
          className={`transition-all active:scale-90 ${
            isStarred ? "text-yellow-400" : "text-white hover:text-yellow-400"
          } ${isStarring ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={handleStar}
          disabled={isStarring}
        >
          <Star
            className={iconSize}
            fill={isStarred ? "currentColor" : "none"}
          />
        </button>
      )}
      <button
        className={`transition-all active:scale-90 ${
          isBookmarked ? "text-orange-500" : "text-white hover:text-orange-500"
        } ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={handleSave}
        disabled={isSaving}
      >
        <Bookmark
          className={iconSize}
          fill={isBookmarked ? "currentColor" : "none"}
        />
      </button>
      <button
        className="text-white transition-all hover:text-blue-500 active:scale-90 cursor-pointer disabled:opacity-50"
        onClick={handleShare}
        disabled={!canShare}
        title={canShare ? "Share" : "Sharing not supported in this browser"}
      >
        <Share2 className={iconSize} />
      </button>
      <Link href={pkg.npmLink} target="_blank" rel="noopener noreferrer">
        <button className="text-white transition-all hover:text-teal-400 active:scale-90 cursor-pointer">
          <ExternalLink className={iconSize} />
        </button>
      </Link>
    </>
  );

  return (
    <div className="flex justify-center items-center h-full ">
      <div className="w-full max-w-md mx-auto relative ">
        <div
          className={`bg-[#121212] rounded-lg shadow-lg text-white p-6 ${
            variant === "default" ? "mr-16 md:mr-0" : ""
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">
              {pkg.repository ? (
                <button
                  onClick={() => setIsReadmeModalOpen(true)}
                  className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>README</span>
                </button>
              ) : (
                <button
                  className="flex items-center space-x-2 pointer-disabled"
                  disabled
                >
                  <BookOpen className="w-5 h-5" />
                  <span>No README</span>
                </button>
              )}
            </span>
            <span className="text-sm text-gray-400">x {pkg.time}</span>
          </div>

          <h2 className="text-4xl font-bold mb-2 break-all">{pkg.name}</h2>
          <div className="text-gray-400 mb-6">
            <p className="break-words">
              {isLongDescription && !isDescriptionExpanded
                ? `${pkg.description.substring(
                    0,
                    DESCRIPTION_TRUNCATE_LENGTH
                  )}...`
                : pkg.description}
            </p>
            {isLongDescription && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-blue-400 hover:underline text-sm font-medium mt-2"
              >
                {isDescriptionExpanded ? "Collapse" : "Read more"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {pkg.tags?.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                disabled={!onTagClick}
                className="bg-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-gray-700 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
              >
                {tag}
              </button>
            ))}
          </div>

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
            {variant === "small" && (
              <div className="flex items-center space-x-4">
                <ActionButtons key="small-actions" iconSize="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="bg-gray-900 rounded-md p-3 flex justify-between items-center">
              <code className="text-sm text-green-400">
                npm install {pkg.name}
              </code>
              <div className="flex space-x-2">
                <button
                  className={`transition-all ${
                    isCopied
                      ? "text-green-500 cursor-not-allowed"
                      : "text-gray-400 hover:text-white cursor-pointer"
                  }`}
                  onClick={handleCopyCommand}
                  disabled={isCopied}
                >
                  {isCopied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Clipboard className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {variant === "default" && (
          <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 flex-col space-y-6 hidden md:flex">
            <ActionButtons key="desktop-actions" iconSize="w-8 h-8" />
          </div>
        )}

        {variant === "default" && (
          <div className="absolute top-1/2 right-2 transform pr-2 -translate-y-1/2 flex flex-col space-y-6 md:hidden">
            <ActionButtons key="mobile-actions" iconSize="w-8 h-8" />
          </div>
        )}
      </div>
      {pkg.repository && (
        <ReadmeModal
          isOpen={isReadmeModalOpen}
          onClose={() => setIsReadmeModalOpen(false)}
          repository={pkg.repository}
        />
      )}
    </div>
  );
}
