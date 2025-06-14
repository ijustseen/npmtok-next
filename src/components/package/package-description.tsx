import { useState } from "react";

interface PackageDescriptionProps {
  description: string;
  shouldGrow?: boolean;
}

const DESCRIPTION_TRUNCATE_LENGTH = 150;

export function PackageDescription({
  description,
  shouldGrow = false,
}: PackageDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription =
    description && description.length > DESCRIPTION_TRUNCATE_LENGTH;

  return (
    <div className={`text-gray-400 mb-6 ${shouldGrow ? "flex-grow" : ""}`}>
      <p className="break-words">
        {isLongDescription && !isExpanded
          ? `${description.substring(0, DESCRIPTION_TRUNCATE_LENGTH)}...`
          : description}
      </p>
      {isLongDescription && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-400 hover:underline text-sm font-medium mt-2"
        >
          {isExpanded ? "Collapse" : "Read more"}
        </button>
      )}
    </div>
  );
}
