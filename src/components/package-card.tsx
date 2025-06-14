"use client";

import { useAIPanel } from "@/contexts/ai-panel-context";
import { PackageHeader } from "./package/package-header";
import { PackageDescription } from "./package/package-description";
import { PackageTags } from "./package/package-tags";
import { PackageStats } from "./package/package-stats";
import { PackageAuthor } from "./package/package-author";
import { PackageActions } from "./package/package-actions";
import { PackageInstall } from "./package/package-install";
import { Package } from "@/types";

type PackageCardProps = {
  package: Package;
  onTagClick?: (tag: string) => void;
  variant?: "default" | "small";
  className?: string;
};

export function PackageCard({
  package: pkg,
  onTagClick,
  variant = "default",
  className = "",
}: PackageCardProps) {
  const { openReadme } = useAIPanel();

  const handleReadmeClick = () => {
    if (pkg.repository) {
      openReadme(pkg.name, pkg.repository);
    }
  };

  const ActionButtons = ({ iconSize }: { iconSize: string }) => (
    <PackageActions
      packageName={pkg.name}
      description={pkg.description}
      npmLink={pkg.npmLink}
      repository={pkg.repository}
      isBookmarked={pkg.isBookmarked}
      iconSize={iconSize}
    />
  );

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`w-full max-w-md mx-auto relative ${
          className.includes("h-full") ? "h-full" : ""
        }`}
      >
        <div
          className={`bg-[#121212] rounded-lg shadow-lg text-white p-6 ${
            className.includes("h-full") ? "h-full flex flex-col" : ""
          } ${variant === "default" ? "mr-16 md:mr-0" : ""}`}
        >
          <PackageHeader
            packageName={pkg.name}
            time={pkg.time}
            repository={pkg.repository}
            onReadmeClick={handleReadmeClick}
          />

          <PackageDescription
            description={pkg.description}
            shouldGrow={className.includes("h-full")}
          />

          <PackageTags tags={pkg.tags} onTagClick={onTagClick} />

          <PackageStats stats={pkg.stats} />

          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <PackageAuthor author={pkg.author} version={pkg.version} />

            {variant === "small" && (
              <div className="flex items-center space-x-4">
                <ActionButtons iconSize="w-5 h-5" />
              </div>
            )}
          </div>

          <PackageInstall packageName={pkg.name} />
        </div>

        {variant === "default" && (
          <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 flex-col space-y-6 hidden md:flex">
            <ActionButtons iconSize="w-8 h-8" />
          </div>
        )}

        {variant === "default" && (
          <div className="absolute top-1/2 right-2 transform pr-2 -translate-y-1/2 flex flex-col space-y-6 md:hidden">
            <ActionButtons iconSize="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
}
