import { BookOpen } from "lucide-react";
import { Repository } from "@/types";

interface PackageHeaderProps {
  packageName: string;
  time: string;
  repository: Repository | null;
  onReadmeClick: () => void;
}

export function PackageHeader({
  packageName,
  time,
  repository,
  onReadmeClick,
}: PackageHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-400">
          {repository ? (
            <button
              onClick={onReadmeClick}
              className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              <span>README</span>
            </button>
          ) : (
            <button
              className="flex items-center space-x-2 pointer-disabled"
              disabled
            >
              <BookOpen className="w-5 h-5" />
              <span>No README</span>
            </button>
          )}
        </span>
        <span className="text-sm text-gray-400">x {time}</span>
      </div>

      <h2 className="text-4xl font-bold mb-2 break-all">{packageName}</h2>
    </>
  );
}
