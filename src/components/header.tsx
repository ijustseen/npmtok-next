"use client";

import { useAuth } from "@/contexts/auth-context";
import { LogIn, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, openLoginModal, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const GoToSaved = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    router.push("/saved");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={user ? "/feed" : "/"} className="text-2xl font-bold">
          NPM<span className="text-pink-500">Tok</span>
        </Link>
        <div className="relative flex-1 max-w-md mx-auto justify-self-center">
          <input
            type="text"
            placeholder="Search packages..."
            className="w-full h-10 px-4 pr-10 text-sm bg-[#121212] border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <Search className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="relative">
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
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                  <button
                    onClick={GoToSaved}
                    className="block w-full text-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
                    Saved Packages
                  </button>
                  <button
                    onClick={signOut}
                    className="block w-full text-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
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
