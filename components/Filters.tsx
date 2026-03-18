"use client";

import React from "react";

interface FiltersProps {
    status: string;
    search: string;
    onStatusChange: (status: string) => void;
    onSearchChange: (search: string) => void;
    onApplySearch: () => void;
    onReset: () => void;
}

const Filters: React.FC<FiltersProps> = ({
    status,
    search,
    onStatusChange,
    onSearchChange,
    onApplySearch,
    onReset,
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 mt-2">
            <div className="flex flex-col md:flex-row gap-6 items-end">
                {/* Status Dropdown */}
                <div className="w-full md:w-48">
                    <label className="block text-[13px] font-bold text-gray-800 mb-2 uppercase">
                        Filter By Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full h-[45px] px-4 bg-[#f8f8f8] border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#f5a623] transition-colors"
                    >
                        <option value="All">All</option>
                        <option value="approval_pending">Check Pending</option>
                    </select>
                </div>

                {/* Search Input */}
                <div className="flex-1 w-full">
                    <label className="block text-[13px] font-bold text-gray-800 mb-2 uppercase">
                        Search By Order #
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="e.g. 000001"
                        className="w-full h-[45px] px-4 bg-[#f8f8f8] border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#f5a623] transition-colors"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onApplySearch}
                        className="h-[45px] px-8 bg-black text-white text-[13px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                        Search
                    </button>
                    <button
                        onClick={onReset}
                        className="h-[45px] px-8 bg-black text-white text-[13px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Filters;
