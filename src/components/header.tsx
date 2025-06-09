import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="text-2xl font-bold">
          NPM<span className="text-pink-500">Tok</span>
        </div>
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search packages..."
            className="w-full h-10 px-4 pr-10 text-sm bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <Search className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div>
          <img
            src="https://api.dicebear.com/8.x/pixel-art/svg?seed=andrew"
            alt="User avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
