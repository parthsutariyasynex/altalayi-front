"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  LogOut,
  Package,
  UserCircle,
  Bell,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import CartDrawer from "./CartDrawer";
import { useCart } from "@/modules/cart/hooks/useCart";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { cart, refetchCart } = useCart();

  // Requirement: Dynamic Username from a variable
  // Requirement: Dynamic Username/Email from session
  const displayUser = session?.user?.name || session?.user?.email || "Devendra Patel";

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = cart?.items?.length || 0;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = (session as any)?.accessToken;
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch("/api/notifications", { headers });
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, session]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => refetchCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [refetchCart]);

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
      {/* Main Header Section */}
      <header className="bg-white border-b border-gray-100 py-3 px-6 md:px-12 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* 1. Left Section: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo/btire-logo-horizontal.svg"
                alt="BTIRE Logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* 2. Middle Section: Optional Brand Logo (Hidden on small screens) */}
          <div className="hidden lg:flex flex-1 justify-center px-10">
            <img
              src="/logo/atcl-bridgestone-logo-v1.jpg"
              alt="Bridgestone Logo"
              className="h-11 w-auto opacity-80"
            />
          </div>

          {/* 3. Right Section: Welcome Badge & Icons Side-by-Side */}
          <div className="flex items-center gap-6">

            {/* Notification Bell */}
            <div className="relative cursor-pointer">
              <div className="text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
                </svg>
              </div>
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#f4b21b] text-black text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Language Selection */}
            <button className="text-[#003d7e] text-xl font-medium hover:text-black transition-colors cursor-pointer">
              Arabic
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
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{displayUser}</p>
                  </div>
                  <Link
                    href="/customer/account"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserCircle size={18} className="text-gray-500" />
                    My Profile
                  </Link>
                  <Link
                    href="/customer/orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Package size={18} className="text-gray-500" />
                    My Orders
                  </Link>
                  <hr className="my-1 border-gray-50" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-black hover:text-[#003d7e] transition-colors p-2 rounded-full hover:bg-gray-100 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#003d7e] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Welcome Badge */}
            {isAuthenticated && (
              <div className="flex items-center gap-2 group cursor-default">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full shadow-sm hover:border-yellow-400 transition-all">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <UserCircle size={14} className="text-black" />
                  </div>
                  <div className="flex flex-col -space-y-0.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Welcome</span>
                    <span className="text-[13px] font-bold text-gray-900 leading-tight">{displayUser}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Secondary Navigation Section */}
      <nav className="bg-[#f5b21a] border-b border-yellow-600/10 w-full relative h-[60px] flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-center">

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-12 text-[17px] text-black font-semibold uppercase tracking-wider">
            <Link
              href="/products"
              className="h-full flex items-center px-6 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
            >
              All Tyres
            </Link>
            <Link
              href="/about"
              className="h-full flex items-center px-6 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
            >
              About Us
            </Link>
            {/* <Link
              href="/locations"
              className="h-full flex items-center px-6 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
            >
              Branch Locations
            </Link> */}
            {/* <Link
              href="/guides"
              className="h-full flex items-center px-6 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
            >
              User Guides
            </Link> */}
            <Link
              href="/catalogue"
              className="h-full flex items-center px-6 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
            >
              Product Catalogue
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex w-full justify-between items-center">
            <span className="text-sm font-bold uppercase tracking-widest text-black/60">Menu</span>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-black hover:bg-black/5 rounded-md transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar/Drawer Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#f5b21a] border-t border-yellow-600/10 shadow-xl md:hidden animate-in slide-in-from-top duration-300 z-40">
            <div className="flex flex-col py-2">
              <Link
                href="/products"
                className="px-8 py-4 text-black font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                All Tyres
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 text-black font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/locations"
                className="px-8 py-4 text-black font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Branch Locations
              </Link>
              <Link
                href="/guides"
                className="px-8 py-4 text-black font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                User Guides
              </Link>
              <Link
                href="/catalogue"
                className="px-8 py-4 text-black font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Product Catalogue
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}