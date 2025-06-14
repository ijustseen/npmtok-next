import { Check, Clipboard } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";

interface PackageInstallProps {
  packageName: string;
}

export function PackageInstall({ packageName }: PackageInstallProps) {
  const { isCopied, copyToClipboard } = useCopy();

  const handleCopyCommand = () => {
    const command = `npm install ${packageName}`;
    copyToClipboard(command);
  };

  return (
    <div className="mt-6">
      <div className="bg-gray-900 rounded-md p-3 flex justify-between items-center">
        <code className="text-sm text-green-400">
          npm install {packageName}
        </code>
        <div className="flex space-x-2">
          <button
            className={`transition-all ${
              isCopied
                ? "text-green-500 cursor-not-allowed"
                : "text-gray-400 hover:text-white cursor-pointer"
            }`}
            onClick={handleCopyCommand}
            disabled={isCopied}
          >
            {isCopied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Clipboard className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
