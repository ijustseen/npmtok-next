interface PackageTagsProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

export function PackageTags({ tags, onTagClick }: PackageTagsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags?.slice(0, 5).map((tag, index) => (
        <button
          key={`${tag}-${index}`}
          onClick={() => onTagClick?.(tag)}
          disabled={!onTagClick}
          className="bg-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-gray-700 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
