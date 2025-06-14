import { Search } from "lucide-react";
import { useSearch } from "@/hooks/use-search";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "Search packages...",
  className = "w-full h-10 px-4 pr-10 text-sm bg-[#121212] border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500",
}: SearchInputProps) {
  const { searchQuery, setSearchQuery, performSearch, handleKeyDown } =
    useSearch();

  return (
    <div className="relative flex-1 max-w-[12rem] md:max-w-md mx-auto justify-self-center">
      <input
        type="text"
        placeholder={placeholder}
        className={className}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={() => performSearch()}
        aria-label="Search"
        className="absolute top-1/2 right-3 -translate-y-1/2 p-1"
      >
        <Search className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}
