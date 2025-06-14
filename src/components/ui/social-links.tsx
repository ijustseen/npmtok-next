import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

export function SocialLinks() {
  return (
    <div className="hidden md:flex items-center gap-4 ml-4">
      <Link
        href="https://github.com/ijustseen"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="hover:text-white text-gray-400"
      >
        <Github className="w-5 h-5" />
      </Link>
      <Link
        href="https://www.linkedin.com/in/andrew-eroshenkov/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="hover:text-white text-gray-400"
      >
        <Linkedin className="w-5 h-5" />
      </Link>
    </div>
  );
}
