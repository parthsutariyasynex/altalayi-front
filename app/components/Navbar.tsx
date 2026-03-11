"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({});
  };

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Navbar */}
      <div className="bg-yellow-400 text-black flex justify-center text-sm font-semibold shadow overflow-x-auto">
        <Link
          href="/my-account"
          className="px-6 py-4 hover:bg-black hover:text-white transition"
        >
          My Account
        </Link>

        <Link
          href="/products"
          className="px-6 py-4 hover:bg-black hover:text-white transition"
        >
          Products
        </Link>

        <Link href="/cart"
          className="px-6 py-4 hover:bg-black hover:text-white transition">
          Cart
        </Link>

        <Link
          href="/change-password"
          className="px-6 py-4 hover:bg-black hover:text-white transition"
        >
          Change Password
        </Link>

        <button
          onClick={handleLogout}
          className="px-6 py-4 hover:bg-black hover:text-white transition border-none bg-transparent font-semibold cursor-pointer"
        >
          Sign Out
        </button>

      </div>
    </div>
  );
}