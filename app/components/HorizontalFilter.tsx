"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, RotateCcw, Search, X } from "lucide-react";
import { api } from "@/lib/api/api-client";

interface Option {
    value: string;
    label: string;
}

interface HorizontalFilterProps {
    onSearch: (width: string, height: string, rim: string) => void;
    initialValues?: { width: string; height: string; rim: string };
}

/**
 * Custom Searchable Dropdown Component
 */
interface SearchableDropdownProps {
    label: string;
    placeholder: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    loading?: boolean;
    disabled?: boolean;
    emptyMessage?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
    label,
    placeholder,
    options,
    value,
    onChange,
    loading,
    disabled,
    emptyMessage = "No options found"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const displayLabel = useMemo(() => {
        if (!value) return placeholder;
        const selected = options.find(o => o.value === value);
        return selected ? selected.label : placeholder;
    }, [value, options, placeholder]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Header / Display Box */}
            <div
                onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-2.5 min-w-[160px] bg-white border rounded cursor-pointer transition-all ${disabled ? "bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400" :
                    loading ? "border-[#f5a623] bg-yellow-50 cursor-wait text-gray-800" :
                        "border-gray-300 hover:border-[#f5a623] text-gray-800"
                    } ${isOpen ? "ring-2 ring-[#f5a623]/20 border-[#f5a623]" : ""}`}
            >
                <span className="text-[14px] font-bold truncate">
                    {loading ? "Loading..." : displayLabel}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Dropdown Menu - PERFECT MATCH TO IMAGE 2 STYLE */}
            {isOpen && (
                <div className="absolute z-[101] left-0 right-0 bottom-full mb-3 bg-white border border-gray-200 rounded shadow-[0_-20px_50px_rgba(0,0,0,0.15)] max-h-[400px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden min-w-[200px]">
                    {/* Header with Group Label (Yellow background, Bold Black text like Image 2) */}
                    <div className="px-4 py-2 bg-[#f5a623] border-b border-yellow-600/20">
                        <span className="text-[14px] font-[900] text-black uppercase tracking-tight">
                            {label.replace(" Options", "")}
                        </span>
                    </div>

                    {/* Search Input Area */}
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2 sticky top-0 bg-white z-10">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search Options..."
                                autoFocus
                                className="w-full pl-8 pr-8 py-1.5 text-[14px] bg-gray-50 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#f5a623] focus:border-[#f5a623] transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-[#f5a623] text-gray-400"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white py-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={`px-4 py-3 text-[14px] font-bold cursor-pointer transition-colors ${value === opt.value
                                        ? "bg-yellow-50 text-black border-l-4 border-[#f5a623]"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-black"
                                        }`}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-[13px] text-gray-500 font-medium italic">
                                {emptyMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const HorizontalFilter: React.FC<HorizontalFilterProps> = ({ onSearch, initialValues }) => {
    const [widthList, setWidthList] = useState<Option[]>([]);
    const [heightList, setHeightList] = useState<Option[]>([]);
    const [rimList, setRimList] = useState<Option[]>([]);

    const [width, setWidth] = useState(initialValues?.width || "");
    const [height, setHeight] = useState(initialValues?.height || "");
    const [rim, setRim] = useState(initialValues?.rim || "");

    const [loadingWidth, setLoadingWidth] = useState(false);
    const [loadingHeight, setLoadingHeight] = useState(false);
    const [loadingRim, setLoadingRim] = useState(false);

    const hasInitialized = useRef(false);

    // Sync state with initialValues (important for external resets)
    useEffect(() => {
        if (initialValues) {
            setWidth(initialValues.width || "");
            setHeight(initialValues.height || "");
            setRim(initialValues.rim || "");
        }
    }, [initialValues?.width, initialValues?.height, initialValues?.rim]);

    // Parse items to always use Label as Value (Request from senior dev)
    const parseOptions = (data: any, type: string): Option[] => {
        let rawItems: any[] = [];
        if (Array.isArray(data)) {
            rawItems = data;
        } else if (typeof data === "object" && data !== null) {
            rawItems = data.options || data.items || data.data || data.sizes
                || data.heights || data.height || data.rims || data.rim || data.widths || data.width || [];

            if (rawItems.length === 0) {
                const firstArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
                if (firstArrayKey) {
                    rawItems = data[firstArrayKey];
                }
            }
        }

        return rawItems
            .map((item: any) => {
                const label = String(item.label ?? item.size ?? item.value ?? (typeof item === 'string' ? item : ""));
                return { value: label, label };
            })
            .filter(opt => opt.label && opt.label !== "undefined" && opt.label !== "None");
    };

    const fetchList = async (
        endpoint: string,
        setter: (list: Option[]) => void,
        loadingSetter: (v: boolean) => void,
        type: string
    ) => {
        if (!endpoint) return;
        loadingSetter(true);
        try {
            const data = await api.get(endpoint);
            setter(parseOptions(data, type));
        } catch (err) {
            console.error(`[HorizontalFilter] ${endpoint} error:`, err);
            setter([]);
        } finally {
            loadingSetter(false);
        }
    };

    // 1. Initial Load
    useEffect(() => {
        fetchList("/tyre-size/width", setWidthList, setLoadingWidth, "Width");
        fetchList("/tyre-size/height", setHeightList, setLoadingHeight, "Heights");
        fetchList("/tyre-size/rim", setRimList, setLoadingRim, "Rims");
    }, []);

    // 2. Cascade Height
    useEffect(() => {
        if (!hasInitialized.current) return;
        if (width) {
            fetchList(`/tyre-size/height?width=${width}`, setHeightList, setLoadingHeight, "Height");
            setHeight("");
            setRim("");
        } else {
            fetchList("/tyre-size/height", setHeightList, setLoadingHeight, "All Heights");
            setRimList([]);
        }
        onSearch(width, "", "");
    }, [width]);

    // 3. Cascade Rim
    useEffect(() => {
        if (!hasInitialized.current) return;
        if (width && height) {
            fetchList(`/tyre-size/rim?width=${width}&height=${height}`, setRimList, setLoadingRim, "Rim");
        } else {
            fetchList("/tyre-size/rim", setRimList, setLoadingRim, "All Rims");
        }
        if (width && height) setRim("");
        onSearch(width, height, "");
    }, [width, height]);

    // 4. Rim
    useEffect(() => {
        if (hasInitialized.current && rim) {
            onSearch(width, height, rim);
        }
    }, [rim]);

    useEffect(() => { hasInitialized.current = true; }, []);

    const handleSearchClick = () => onSearch(width, height, rim);

    const handleReset = () => {
        setWidth("");
        setHeight("");
        setRim("");
        fetchList("/tyre-size/height", setHeightList, setLoadingHeight, "All Heights");
        fetchList("/tyre-size/rim", setRimList, setLoadingRim, "All Rims");
        onSearch("", "", "");
    };

    return (
        <div className="w-full bg-white h-full px-6 flex items-center justify-center gap-4 flex-nowrap overflow-visible relative">
            {/* Label */}
            <div className="bg-[#f5a623] px-6 py-2.5 rounded shadow-sm flex-shrink-0">
                <span className="text-black font-[900] italic uppercase text-[15px] tracking-tight whitespace-nowrap">
                    Search by Size
                </span>
            </div>

            {/* Dropdowns with skeletons to prevent jump */}
            <div className="flex-1 max-w-[200px] h-[45px]">
                {loadingWidth ? (
                    <Skeleton className="w-full h-full" />
                ) : (
                    <SearchableDropdown
                        label="Width"
                        placeholder="Width"
                        options={widthList}
                        value={width}
                        onChange={setWidth}
                        loading={loadingWidth}
                    />
                )}
            </div>

            <div className="flex-1 max-w-[200px] h-[45px]">
                {loadingHeight ? (
                    <Skeleton className="w-full h-full" />
                ) : (
                    <SearchableDropdown
                        label="Height"
                        placeholder="Height"
                        options={heightList}
                        value={height}
                        onChange={setHeight}
                        loading={loadingHeight}
                        emptyMessage="No heights available"
                    />
                )}
            </div>

            <div className="flex-1 max-w-[200px] h-[45px]">
                {loadingRim ? (
                    <Skeleton className="w-full h-full" />
                ) : (
                    <SearchableDropdown
                        label="Rim"
                        placeholder="Rim"
                        options={rimList}
                        value={rim}
                        onChange={setRim}
                        loading={loadingRim}
                        emptyMessage="No rims available"
                    />
                )}
            </div>

            <button
                onClick={handleSearchClick}
                className="bg-[#f5a623] hover:bg-black hover:text-white px-10 py-2.5 h-[45px] rounded border-none shadow-sm transition-all text-black font-[900] italic uppercase text-[15px] tracking-tight ml-2 active:scale-95 cursor-pointer flex-shrink-0 flex items-center justify-center"
            >
                Search
            </button>

            <div className="w-[45px] h-[45px] flex-shrink-0">
                {(width || height || rim) && (
                    <button
                        onClick={handleReset}
                        className="w-full h-full rounded border border-gray-300 bg-white text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Clear filter"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};


export default HorizontalFilter;
