import { LogOut, Bookmark, Star } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useStar } from "@/hooks/use-star";
import Image from "next/image";
import { useState } from "react";

interface UserMenuProps {
  onSavedPackages: () => void;
}

const REPO_OWNER = "ijustseen";
const REPO_NAME = "npmtok-next";

export function UserMenu({ onSavedPackages }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isStarred, isStarring, toggleStar } = useStar({
    owner: REPO_OWNER,
    name: REPO_NAME,
  });

  if (!user) return null;

  return (
    <div className="relative">
      <Image
        src={user.user_metadata.avatar_url}
        alt="User avatar"
        width={40}
        height={40}
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      />
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#121212] border border-gray-700 rounded-lg shadow-lg py-1">
          <button
            onClick={onSavedPackages}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/10 cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            Saved Packages
          </button>
          <button
            onClick={toggleStar}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-all ${
              isStarred
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            } hover:bg-white/10 ${
              isStarring ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            disabled={isStarring}
          >
            <Star
              className="w-4 h-4"
              fill={isStarred ? "currentColor" : "none"}
            />
            {isStarred ? "Thanks for star!" : "Give me a star"}
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
