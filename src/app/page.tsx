"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, signInWithGithub, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/feed");
    }
  }, [user, router]);

  if (loading) {
    return (
      <main className="flex flex-col justify-center items-center min-h-screen">
        <h1>Loading...</h1>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex flex-col justify-center items-center min-h-screen">
        <h1> Welcome, {user.email} </h1>
        <button onClick={signOut}> Sign out </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center min-h-screen">
      <h1> NPMTok </h1>
      <h3> TikTok, but with npm packages</h3>
      <button onClick={signInWithGithub}> Continue with GitHub </button>
    </main>
  );
}
