import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  centered?: boolean;
}

export function LoadingIndicator({
  size = "md",
  text,
  centered = true,
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-16 h-16",
  };

  const containerClasses = centered
    ? "flex items-center justify-center"
    : "flex items-center";

  return (
    <div className={containerClasses}>
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      {text && <span className="ml-3 text-gray-400">{text}</span>}
    </div>
  );
}
