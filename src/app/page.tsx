"use client";

import { useAuth } from "@/contexts/auth-context";
import { MainLayout } from "@/components/main-layout";
import { Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, signInWithGithub, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/feed");
    }
  }, [user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        <h1 className="text-xl text-white">Loading...</h1>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex flex-col justify-center bg-black items-center min-h-screen">
        <h1> Welcome, {user.email} </h1>
      </main>
    );
  }

  return (
    <MainLayout>
      <main className="flex flex-col items-center justify-center min-h-screen bg-black text-center text-white">
        <h1 className="text-7xl font-extrabold">
          NPM<span className="text-pink-500">Tok</span>
        </h1>
        <h3 className="mt-4 text-xl text-gray-400">
          TikTok but with npm packages instead
        </h3>
        <button
          onClick={signInWithGithub}
          className="mt-12 flex items-center justify-center gap-3 rounded-lg bg-gray-800 hover:bg-gray-700 px-6 py-3 font-semibold text-white transition-colors"
        >
          <Github className="h-6 w-6" />
          Continue with GitHub
        </button>
        <button
          onClick={() => router.push("/feed")}
          className="mt-4 text-gray-400 hover:text-white"
        >
          or just check what it is
        </button>
      </main>
    </MainLayout>
  );
}
