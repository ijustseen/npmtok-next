"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      }
    };
    getUser();
  }, [supabase]);

  const handleSignInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
      <main className="flex flex-col justify-center items-center min-h-screen">
        <h1> Welcome, {user.email} </h1>
        <button onClick={handleSignOut}> Sign out </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center min-h-screen">
      <h1> NPMTok </h1>
      <h3> TikTok, but with npm packages</h3>
      <button onClick={handleSignInWithGithub}> Continue with GitHub </button>
    </main>
  );
}
