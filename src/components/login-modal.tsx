"use client";

import { useAuth } from "@/contexts/auth-context";
import { Github, X } from "lucide-react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGithub } = useAuth();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-[#121212] border border-gray-700 rounded-lg p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please log in to continue</h2>
          <p className="text-gray-400 mb-6">
            To perform this action, you need to be logged in.
          </p>
          <button
            onClick={signInWithGithub}
            className="w-full flex justify-center items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 border border-gray-700 rounded-lg"
          >
            <Github className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}
