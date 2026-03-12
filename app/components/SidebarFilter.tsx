"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Filter, Search, X } from "lucide-react";

export interface FilterOption {
    value: string;
    label: string;
    count: number;
}

export interface FilterGroupData {
    code: string;
    label: string;
    options: FilterOption[];
}

export default function SidebarFilter({
    categoryId = "5",
    onFilterChange,
    selectedFilters: externalSelectedFilters = {}
}: {
    categoryId?: string;
    onFilterChange?: (filters: Record<string, string[]>, filterLabels: Record<string, { value: string; label: string }[]>) => void;
    selectedFilters?: Record<string, string[]>;
}) {
    const [filterGroups, setFilterGroups] = useState<FilterGroupData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Selected state - sync with prop
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(externalSelectedFilters);

    // Sync internal state with external prop changes
    useEffect(() => {
        setSelectedFilters(externalSelectedFilters);
    }, [externalSelectedFilters]);

    // Accordion state - expand 'brand' and 'item_code' by default for better UX, or let them all collapse
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get token if available for authorized requests
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json'
                };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`/api/filters?categoryId=${categoryId}`, {
                    headers,
                    cache: 'no-store'
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || errData.error || `Failed to load filters (${res.status})`);
                }

                const data = await res.json();
                const fetchedFilters = data.filters || [];
                setFilterGroups(fetchedFilters);

                // Auto-expand the first 3 groups if not already set
                if (fetchedFilters.length > 0) {
                    const initialExpanded: Record<string, boolean> = {};
                    fetchedFilters.slice(0, 3).forEach((group: FilterGroupData) => {
                        initialExpanded[group.code] = true;
                    });
                    setExpandedGroups(prev => Object.keys(prev).length === 0 ? initialExpanded : prev);
                }
            } catch (err: any) {
                console.error("Filter fetch error:", err);
                setError(err.message || "Could not load filters");
            } finally {
                setLoading(false);
            }
        };

        fetchFilters();
    }, [categoryId]);

    // Remove URL load logic, parent will handle defaults if necessary

    const toggleGroup = (code: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [code]: !prev[code],
        }));
    };

    // Remove applyFiltersToUrl in favor of callback

    const handleCheckboxChange = useCallback((code: string, value: string, checked: boolean) => {
        const currentValues = selectedFilters[code] || [];
        let newValues;

        if (checked) {
            newValues = [...currentValues, value];
        } else {
            newValues = currentValues.filter((v) => v !== value);
        }

        const nextState = { ...selectedFilters, [code]: newValues };
        if (newValues.length === 0) {
            delete nextState[code];
        }

        setSelectedFilters(nextState);
        if (onFilterChange) {
            const nextLabels: Record<string, { value: string; label: string }[]> = {};
            Object.entries(nextState).forEach(([c, vals]) => {
                const group = filterGroups.find((g) => g.code === c);
                if (group) {
                    nextLabels[c] = vals.map(v => {
                        const opt = group.options.find(o => o.value === v);
                        return { value: v, label: opt ? opt.label : v };
                    });
                }
            });
            onFilterChange(nextState, nextLabels);
        }
    }, [selectedFilters, onFilterChange, filterGroups]);

    const clearFilters = () => {
        setSelectedFilters({});
        if (onFilterChange) {
            onFilterChange({}, {});
        }
    };

    const activeFilterCount = Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0);

    return (
        <aside className="w-[300px] flex-shrink-0 bg-white border-r border-gray-200 h-[calc(100vh-64px)] overflow-hidden flex flex-col sticky top-16 relative">

            {/* Header section with proper styling */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                    <h2 className="font-bold text-gray-900 text-[15px] tracking-wide uppercase">
                        Filters
                    </h2>
                    {activeFilterCount > 0 && (
                        <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 animate-in zoom-in duration-300">
                            {activeFilterCount}
                        </span>
                    )}
                </div>

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider flex items-center gap-1 group cursor-pointer"
                    >
                        <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Scrollable Filter Area */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-white">

                {loading && (
                    <div className="p-10 flex flex-col gap-3 justify-center items-center">
                        <div className="w-8 h-8 border-[3px] border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-semibold text-gray-400">Loading Filters...</span>
                    </div>
                )}

                {error && (
                    <div className="p-5 m-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium">
                        {error}
                    </div>
                )}

                <div className="flex flex-col">
                    {!loading && !error && filterGroups.map((group) => {
                        const isExpanded = expandedGroups[group.code] || false;

                        if (!group.options || group.options.length === 0) return null;

                        const selectedInGroup = selectedFilters[group.code]?.length || 0;

                        return (
                            <div key={group.code} className="border-b border-gray-100 last:border-b-0">

                                {/* Accordion Toggle Button */}
                                <button
                                    onClick={() => toggleGroup(group.code)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 group-btn cursor-pointer"
                                    aria-expanded={isExpanded}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800 text-[13px] uppercase tracking-wide">
                                            {group.label}
                                        </span>
                                        {selectedInGroup > 0 && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                        )}
                                    </div>

                                    <div className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                </button>

                                {/* Accordion Content List */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="px-6 pb-4 overflow-y-auto max-h-[300px] custom-scrollbar flex flex-col gap-2">
                                        {group.options.map((option) => {
                                            const isChecked = selectedFilters[group.code]?.includes(option.value) || false;

                                            return (
                                                <label
                                                    key={option.value}
                                                    className="flex items-center justify-between cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex items-center justify-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => handleCheckboxChange(group.code, option.value, e.target.checked)}
                                                                className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded-[3px] checked:bg-yellow-400 checked:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-1 transition-all cursor-pointer"
                                                            />
                                                            <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                                                                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                        <span className={`text-[13px] transition-colors ${isChecked ? 'text-black font-bold' : 'text-gray-600 font-medium group-hover:text-black'}`}>
                                                            {option.label} ({option.count})
                                                        </span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>
        </aside>
    );
}