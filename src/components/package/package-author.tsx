import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";

interface PackageAuthorProps {
  author: string;
  version: string;
}

export function PackageAuthor({ author, version }: PackageAuthorProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={`https://github.com/${author}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <Image
              src={`https://github.com/${author}.png?size=32`}
              alt={`${author} avatar`}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
              onError={handleImageError}
            />
          ) : (
            <User className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </Link>
      <div>
        <Link
          href={`https://github.com/${author}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-sm hover:underline">@{author}</p>
        </Link>
        <p className="text-xs text-gray-500">v{version}</p>
      </div>
    </div>
  );
}
