"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchInput } from "./ui/search-input";
import { SocialLinks } from "./ui/social-links";
import { UserMenu } from "./ui/user-menu";
import { LoginButton } from "./ui/login-button";

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const homeUrl = user ? `/feed?refresh=${Date.now()}` : "/";

  const handleGoToSaved = () => {
    if (!user) {
      return;
    }
    router.push("/saved");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 gap-2 items-center justify-between px-4">
        <Link href={homeUrl} className="text-2xl font-bold">
          NPM<span className="text-pink-500">Tok</span>
        </Link>

        <SearchInput />
        <SocialLinks />

        <div className="relative ml-2">
          {user ? (
            <UserMenu onSavedPackages={handleGoToSaved} />
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
