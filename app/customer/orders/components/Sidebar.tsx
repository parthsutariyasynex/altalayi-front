"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: "My Account", href: "/customer/account" },
        { name: "My Statement", href: "/customer/statement" },
        { name: "Manage Accounts", href: "/customer/manage-accounts" },
        { name: "My Orders", href: "/customer/orders" },
        { name: "My Order Attachments", href: "/customer/order-attachments" },
        { name: "Favourite Products", href: "/customer/favourite-products" },
        { name: "Address Book", href: "/customer/address-book" },
        { name: "Dashboard", href: "/customer/dashboard" },
        { name: "My Forecast", href: "/customer/forecast" },
        { name: "Notifications", href: "/customer/notifications" },
    ];

    return (
        <aside className="w-full md:w-[260px] flex-shrink-0 bg-[#f8f9fa] p-6 rounded-sm min-h-[600px]">
            <nav>
                <ul className="text-[14px] flex flex-col gap-1">
                    {menuItems.map((item, idx) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={idx}>
                                <Link
                                    href={item.href}
                                    className={`block py-3 px-3 transition-all duration-200 border-l-[3px] ${isActive
                                        ? "font-bold text-black border-[#f5a623] bg-white shadow-sm"
                                        : "text-gray-600 border-transparent hover:text-black hover:border-gray-200"
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
                            className="block w-full text-left py-3 px-3 text-gray-600 border-l-[3px] border-transparent hover:text-black hover:border-gray-200 transition-all duration-200"
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
