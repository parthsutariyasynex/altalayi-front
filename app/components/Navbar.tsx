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
    <div className="w-full sticky top-0 z-50 flex flex-col">
      {/* Header Section */}
      <header className="bg-gray-100 border-b border-gray-200 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Section: BTIRE Logo */}
          <div className="flex-1 flex justify-start">
            <div className="h-10 flex items-center">
              <img
                src="/logo/btire-logo-horizontal.svg"
                alt="BTIRE Logo"
                className="h-15 w-auto"
              />
            </div>
          </div>

          {/* Center Section: Bridgestone Altalayi Logo */}
          <div className="flex-1 flex justify-center">
            <div className="h-12 flex items-center">
              {/* Bridgestone Altalayi logo placeholder */}
              <img
                src="/logo/atcl-bridgestone-logo-v1.jpg"
                alt="BTIRE Logo"
                className="h-15 w-auto"
              />
            </div>
          </div>

          {/* Right Section: Language Switch */}
          <div className="flex-1 flex justify-end">
            <button className="text-gray-700 font-semibold hover:text-black transition-colors flex items-center gap-2 cursor-pointer">
              <span className="text-sm">Arabic</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar Section */}
      <nav className="bg-[#f4b21b] shadow-md w-full h-[50px] md:h-[60px] flex items-center justify-center">
        <div className="max-w-7xl w-full flex items-center justify-center px-4">
          <div className="flex items-center justify-center gap-8 md:gap-16 text-black font-semibold">
            <Link
              href="/products"
              className="px-6 h-[60px] flex items-center transition-all duration-200 hover:bg-gray-900 hover:text-white cursor-pointer">
              All Tyres
            </Link>

            <Link
              href="/about"
              className="px-6 h-[60px] flex items-center transition-all duration-200 hover:bg-gray-900 hover:text-white cursor-pointer">
              About Us
            </Link>

            <Link
              href="/catalogue"
              className="px-6 h-[60px] flex items-center transition-all duration-200 hover:bg-gray-900 hover:text-white cursor-pointer"            >
              Product Catalogue
            </Link>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-6 h-[60px] flex items-center transition-all duration-200 hover:bg-gray-900 hover:text-white cursor-pointer">
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}