"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  LogIn,
  Search,
  Bookmark,
  LogOut,
  Star,
  Github,
  Linkedin,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export function Header() {
  const { user, session, openLoginModal, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isStarring, setIsStarring] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const homeUrl = user ? `/feed?refresh=${Date.now()}` : "/";

  // Repository data for starring
  const REPO_OWNER = "ijustseen";
  const REPO_NAME = "npmtok-next";

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Check star status on load
  useEffect(() => {
    const checkStarred = async () => {
      if (!user || !session?.provider_token) return;

      const response = await fetch(
        `/api/star?owner=${encodeURIComponent(
          REPO_OWNER
        )}&repo=${encodeURIComponent(REPO_NAME)}`,
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
  }, [user, session]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const GoToSaved = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    router.push("/saved");
  };

  const handleStarUs = async () => {
    if (!user || !session?.provider_token) {
      openLoginModal();
      return;
    }

    setIsStarring(true);

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
          body: JSON.stringify({ owner: REPO_OWNER, repo: REPO_NAME }),
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
          body: JSON.stringify({ owner: REPO_OWNER, repo: REPO_NAME }),
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 gap-2 items-center justify-between px-4">
        <Link href={homeUrl} className="text-2xl font-bold">
          NPM<span className="text-pink-500">Tok</span>
        </Link>
        <div className="relative flex-1 max-w-[12rem] md:max-w-md mx-auto justify-self-center">
          <input
            type="text"
            placeholder="Search packages..."
            className="w-full h-10 px-4 pr-10 text-sm bg-[#121212] border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button
            onClick={() => {
              if (searchQuery.trim() !== "") {
                router.push(
                  `/search?q=${encodeURIComponent(searchQuery.trim())}`
                );
              }
            }}
            aria-label="Search"
            className="absolute top-1/2 right-3 -translate-y-1/2 p-1"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="hidden md:flex items-center gap-4 ml-4">
          <Link
            href="https://github.com/ijustseen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-white text-gray-400"
          >
            <Github className="w-5 h-5" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/andrew-eroshenkov /"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-white text-gray-400"
          >
            <Linkedin className="w-5 h-5" />
          </Link>
        </div>
        <div className="relative ml-2">
          {user ? (
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
                    onClick={GoToSaved}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/10 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4" />
                    Saved Packages
                  </button>
                  <button
                    onClick={handleStarUs}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-all ${
                      isStarred
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    } hover:bg-white/10 ${
                      isStarring
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
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
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center space-x-2 bg-[#121212] hover:bg-gray-700 text-white font-semibold w-10 h-10 border border-gray-700 rounded-full cursor-pointer"
            >
              <LogIn className="w-5 h-5 m-auto" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
