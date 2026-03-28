"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

let savedScrollY = 0;

function lockScroll() {
    savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
}

function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.overflow = "";
    window.scrollTo(0, savedScrollY);
}

/**
 * Reusable Side Drawer component that slides in from the right.
 */
export default function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            lockScroll();
            return () => unlockScroll();
        } else {
            // Keep rendered for exit animation, then remove
            const timer = setTimeout(() => setIsRendered(false), 300);
            unlockScroll();
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // ESC key
    const handleEsc = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [handleEsc]);

    if (!isRendered && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex justify-end ${isOpen ? "visible" : "invisible pointer-events-none"}`}>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Side Panel */}
            <div
                className={`relative w-full sm:w-[480px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-[110] p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
                >
                    <X size={22} strokeWidth={2.5} />
                </button>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
