import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function LoginButton() {
  const { openLoginModal } = useAuth();

  return (
    <button
      onClick={openLoginModal}
      className="flex items-center space-x-2 bg-[#121212] hover:bg-gray-700 text-white font-semibold w-10 h-10 border border-gray-700 rounded-full cursor-pointer"
    >
      <LogIn className="w-5 h-5 m-auto" />
    </button>
  );
}
