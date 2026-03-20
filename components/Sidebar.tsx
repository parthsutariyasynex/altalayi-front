"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: "My Account", href: "/customer/account" },
        { name: "My Statement", href: "/customer/statement" },
        { name: "My Orders", href: "/my-orders" },
        { name: "My Order Attachments", href: "/customer/order-attachments" },
        { name: "Favourite Products", href: "/customer/favourite-products" },
        { name: "Address Book", href: "/customer/address-book" },
        { name: "Dashboard", href: "/customer/dashboard" },
        { name: "My Forecast", href: "/customer/forecast" },
        { name: "Notifications", href: "/customer/notifications" },
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0 bg-[#f8f8f8] p-4 min-h-screen">
            <nav>
                <ul className="space-y-1">
                    {menuItems.map((item, idx) => {
                        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        return (
                            <li key={idx}>
                                <Link
                                    href={item.href}
                                    className={`block py-3 px-4 transition-all duration-200 ${isActive
                                        ? "font-bold text-black border-l-4 border-[#f5a623] bg-white shadow-sm"
                                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                    <li>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="block w-full text-left py-3 px-4 text-gray-600 hover:text-black hover:bg-gray-100 transition-all duration-200"
                        >
                            Sign Out
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
