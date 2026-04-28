"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 p-3 w-full rounded-xl text-red-400 hover:bg-red-400/5 transition-colors"
    >
      <LogOut className="w-5 h-5" />
      Cerrar Sesión
    </button>
  );
}
