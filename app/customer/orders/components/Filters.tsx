"use client";

import React, { useState, useRef, useEffect } from "react";

interface FiltersProps {
    status: string;
    orderNumber: string;
    onStatusChange: (status: string) => void;
    onOrderNumberChange: (order: string) => void;
    onSearch: () => void;
    onReset: () => void;
}

const Filters: React.FC<FiltersProps> = ({
    status,
    orderNumber,
    onStatusChange,
    onOrderNumberChange,
    onSearch,
    onReset,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [statusOptions, setStatusOptions] = useState<string[]>(["All"]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch dynamic status options
    useEffect(() => {
        async function fetchStatuses() {
            try {
                const res = await fetch("/api/kleverapi/order-statuses", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await res.json();

                // Assuming data is an array of strings or has an items property
                const fetchedOptions = Array.isArray(data)
                    ? data
                    : (data.items || data.data || []);

                if (fetchedOptions.length > 0) {
                    // Ensure "All" is always at the top if not present
                    const finalOptions = fetchedOptions.includes("All")
                        ? fetchedOptions
                        : ["All", ...fetchedOptions];
                    setStatusOptions(finalOptions);
                } else {
                    // Fallback to minimal if nothing returned
                    setStatusOptions(["All", "Check Pending"]);
                }
            } catch (error) {
                console.error("Failed to fetch order statuses:", error);
                // Fallback for safety
                setStatusOptions(["All", "Check Pending"]);
            }
        }
        fetchStatuses();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        onStatusChange(value);
        setIsOpen(false);
    };

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-x-5 gap-y-4 items-end">
                {/* Custom Status Dropdown */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-bold text-black uppercase tracking-tight">
                        Filter By Status
                    </label>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="h-[42px] w-[180px] px-3 bg-[#f5a623] text-black text-[13px] font-bold flex items-center justify-between cursor-pointer focus:outline-none rounded-[1px]"
                        >
                            <span>{status}</span>
                            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isOpen && (
                            <ul className="absolute top-full left-0 w-[180px] bg-[#f5a623] z-50 shadow-md max-h-[320px] overflow-y-auto border-t border-black/10">
                                {statusOptions.map((opt: string) => (
                                    <li key={opt}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(opt)}
                                            className={`w-full text-left px-3 py-2 text-[13px] text-black hover:bg-black hover:text-white transition-colors ${status === opt ? "bg-black/20 font-bold" : ""}`}
                                        >
                                            {opt}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Order Number Input */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-bold text-black uppercase tracking-tight">
                        Filter By Order
                    </label>
                    <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => onOrderNumberChange(e.target.value)}
                        className="h-[42px] w-[220px] px-3 bg-white border border-gray-300 text-[13px] focus:outline-none focus:border-black rounded-[1px]"
                    />
                </div>

                <div className="flex gap-2.5">
                    <button
                        onClick={onSearch}
                        className="h-[42px] px-8 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-[1px]"
                    >
                        SEARCH
                    </button>
                    <button
                        onClick={onReset}
                        className="h-[42px] px-8 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-[1px]"
                    >
                        RESET
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Filters;
