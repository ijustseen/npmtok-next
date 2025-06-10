"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { X } from "lucide-react";
import "highlight.js/styles/github-dark.css";

type ReadmeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  repository: {
    owner: string;
    name: string;
  };
};

export function ReadmeModal({ isOpen, onClose, repository }: ReadmeModalProps) {
  const [readme, setReadme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && repository) {
      const fetchReadme = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const { owner, name: repo } = repository;
          const response = await fetch(
            `/api/readme?owner=${encodeURIComponent(
              owner
            )}&repo=${encodeURIComponent(repo)}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch README");
          }
          const data = await response.json();
          setReadme(data.content);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchReadme();
    }
  }, [isOpen, repository]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e1e] rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-2/3 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">README.md</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <p className="text-white">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <article className="prose prose-invert prose-sm md:prose-base max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
              >
                {readme}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </div>
      <style jsx global>{`
        .prose {
          color: #d1d5db;
        }
        .prose h1 {
          font-size: 2em;
          font-weight: 600;
          padding-bottom: 0.3em;
          border-bottom: 1px solid #4b5563;
          margin-top: 1.5em;
          margin-bottom: 1em;
        }
        .prose h2 {
          font-size: 1.5em;
          font-weight: 600;
          padding-bottom: 0.3em;
          border-bottom: 1px solid #4b5563;
          margin-top: 1.5em;
          margin-bottom: 1em;
        }
        .prose h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 1em;
        }
        .prose h4,
        .prose h5,
        .prose h6 {
          font-size: 1em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 1em;
        }
        .prose h1,
        .prose h2,
        .prose h3,
        .prose h4,
        .prose h5,
        .prose h6 {
          color: #ffffff;
        }
        .prose a {
          color: #3b82f6;
        }
        .prose a:hover {
          text-decoration: underline;
        }
        .prose pre {
          background-color: transparent;
          color: #e5e7eb;
          padding: 0;
          border-radius: 0;
        }
        .prose code {
          background-color: #2b2b2b;
          padding: 0.2em 0.4em;
          margin: 0;
          font-size: 85%;
          border-radius: 3px;
        }
        .prose blockquote {
          border-left-color: #4b5563;
          color: #9ca3af;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
        }
        .prose th,
        .prose td {
          border: 1px solid #4b5563;
          padding: 0.5em 1em;
        }
        .prose th {
          background-color: #1f2937;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
