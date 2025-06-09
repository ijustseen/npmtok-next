"use client";

import { useAuth } from "@/contexts/auth-context";
import { LogIn, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export function Header() {
  const { user, openLoginModal, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={user ? "/feed" : "/"} className="text-2xl font-bold">
          NPM<span className="text-pink-500">Tok</span>
        </Link>
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search packages..."
            className="w-full h-10 px-4 pr-10 text-sm bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 border border-gray-700 rounded-full"
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
