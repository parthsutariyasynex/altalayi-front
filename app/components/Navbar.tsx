"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { User, ShoppingCart, LogOut, Package, UserCircle } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          // Assuming data is an array as per user example logic
          setNotificationCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Fetch Cart Items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          // Assuming data.items is an array as per user example logic
          setCartCount(data?.items?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full sticky top-0 z-50 flex flex-col">
      {/* Welcome Banner */}
      {isAuthenticated && session?.user?.name && (
        <div className="bg-[#f4b21b] py-1 flex justify-right items-right">
          <span className="text-black font-medium text-lg">
            Welcome: {session.user.name}
          </span>
        </div>
      )}

      {/* Header Section */}
      <header className="bg-white border-b border-gray-100 py-3 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Section: BTIRE Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="h-10 flex items-center">
              <img
                src="/logo/btire-logo-horizontal.svg"
                alt="BTIRE Logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Center Section: Bridgestone Altalayi Logo */}
          <div className="flex-1 hidden md:flex justify-center">
            <div className="h-12 flex items-center">
              <img
                src="/logo/atcl-bridgestone-logo-v1.jpg"
                alt="Bridgestone Altalayi Logo"
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Right Section: Icons Exactly Like Image */}
          <div className="flex-1 flex justify-end items-center gap-8">
            {/* Notification Bell */}
            <div className="relative cursor-pointer">
              <div className="text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
                </svg>
              </div>
              <span className="absolute -top-2 -right-2 bg-[#f4b21b] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {notificationCount}
              </span>
            </div>

            {/* Language Selection */}
            <button className="text-[#003d7e] font-medium hover:text-black transition-colors flex items-center gap-2 cursor-pointer">
              <span className="text-xl">Arabic</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="text-black transition-colors cursor-pointer flex items-center"
                aria-label="User Profile"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.33 4 18V20H20V18C20 15.33 14.67 14 12 14Z" />
                  </svg>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <Link
                    href="/customer/account"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserCircle size={18} className="text-gray-500" />
                    My Profile
                  </Link>
                  <Link
                    href="/customer/orders"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Package size={18} className="text-gray-500" />
                    My Orders
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative text-black transition-colors cursor-pointer"
              aria-label="Shopping Cart"
            >
              <div className="w-9 h-9">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C21.05 5.17 21.14 4.84 21.14 4.5C21.14 3.4 20.24 2.5 19.14 2.5H4.21L3.27 0.5H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#f4b21b]">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Bar Section */}
      <nav className="bg-[#f4b21b] shadow-md w-full h-[50px] md:h-[60px] flex items-center justify-center">
        <div className="max-w-7xl w-full flex items-center justify-center px-4">
          <div className="flex items-center justify-center gap-8 md:gap-16 text-black font-semibold">
            <Link
              href="/products"
              className="px-6 h-[60px] flex items-center transition-all duration-200 hover:bg-gray-900 hover:text-white cursor-pointer"
            >
              All Tyres
            </Link>

            <Link
              href="/about"
              className="px-6 h-[60px] flex items-center transition-all duration-200 hover:bg-gray-900 hover:text-white cursor-pointer"
            >
              About Us
            </Link>

            <Link
              href="/catalogue"
              className="px-6 h-[60px] flex items-center transition-all duration-200 hover:bg-gray-900 hover:text-white cursor-pointer"
            >
              Product Catalogue
            </Link>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-6 h-[60px] flex items-center transition-all duration-200 hover:bg-gray-900 hover:text-white cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}