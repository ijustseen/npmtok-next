import { Header } from "@/components/header";
import { Feed } from "@/components/feed";
import { Suspense } from "react";

export default function FeedPage() {
  return (
    <main className="bg-black text-white">
      <Suspense
        fallback={
          <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
            Loading...
          </div>
        }
      >
        <Header />
        <Feed />
      </Suspense>
    </main>
  );
}
