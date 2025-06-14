import { Star, Bookmark, Share2, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { useStar } from "@/hooks/use-star";
import { useBookmark } from "@/hooks/use-bookmark";
import { useShare } from "@/hooks/use-share";
import { useAIPanel } from "@/contexts/ai-panel-context";
import { Repository } from "@/types";

interface PackageActionsProps {
  packageName: string;
  description: string;
  npmLink: string;
  repository: Repository | null;
  isBookmarked?: boolean;
  iconSize: string;
}

export function PackageActions({
  packageName,
  description,
  npmLink,
  repository,
  isBookmarked = false,
  iconSize,
}: PackageActionsProps) {
  const { isStarred, isStarring, toggleStar } = useStar(repository);
  const {
    isBookmarked: bookmarked,
    isSaving,
    toggleBookmark,
  } = useBookmark(packageName, isBookmarked);
  const { canShare, share } = useShare();
  const { openPanel } = useAIPanel();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/search?q=${encodeURIComponent(
      packageName
    )}`;
    await share(`Check out ${packageName} on NpmTok`, description, shareUrl);
  };

  const handleAIAction = () => {
    openPanel(packageName, repository);
  };

  return (
    <>
      {repository && (
        <button
          className={`transition-all active:scale-90 ${
            isStarred ? "text-yellow-400" : "text-white hover:text-yellow-400"
          } ${isStarring ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={toggleStar}
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
          bookmarked ? "text-orange-500" : "text-white hover:text-orange-500"
        } ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={toggleBookmark}
        disabled={isSaving}
      >
        <Bookmark
          className={iconSize}
          fill={bookmarked ? "currentColor" : "none"}
        />
      </button>
      <button
        className="text-white transition-all hover:text-purple-400 active:scale-90 cursor-pointer"
        onClick={handleAIAction}
        title="AI Generation"
      >
        <Sparkles className={iconSize} />
      </button>
      <button
        className="text-white transition-all hover:text-blue-500 active:scale-90 cursor-pointer disabled:opacity-50"
        onClick={handleShare}
        disabled={!canShare}
        title={canShare ? "Share" : "Sharing not supported in this browser"}
      >
        <Share2 className={iconSize} />
      </button>
      <Link href={npmLink} target="_blank" rel="noopener noreferrer">
        <button className="text-white transition-all hover:text-teal-400 active:scale-90 cursor-pointer">
          <ExternalLink className={iconSize} />
        </button>
      </Link>
    </>
  );
}
