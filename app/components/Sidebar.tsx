"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterCategory {
  attribute_code: string;
  label: string;
  options: FilterOption[];
}

export default function Sidebar() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = params?.id as string;

  const [filters, setFilters] = useState<FilterCategory[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize selected from URL search params
  useEffect(() => {
    if (searchParams) {
      const currentSelected: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        currentSelected[key] = value;
      });
      setSelected(currentSelected);
    }
  }, [searchParams]);

  // Fetch Filters from our Next.js API Proxy
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prevents passing string "undefined" to the API
        const activeCategoryId = categoryId && categoryId !== "[id]" && categoryId !== "undefined" ? categoryId : "5";
        console.log("🔥 Active Category ID:", activeCategoryId);

        // Fetch from the proxy route
        const res = await fetch(`/api/filters?categoryId=${activeCategoryId}`);

        if (!res.ok) {
          throw new Error(`Failed to load filters. Status: ${res.status}`);
        }

        const data = await res.json();
        console.log("🔥 Filter API Response:", data);

        let formatted: FilterCategory[] = [];

        // Handle varying dynamic API responses safely with optional chaining
        if (Array.isArray(data)) {
          formatted = data;
        } else if (Array.isArray(data?.filters)) {
          formatted = data.filters;
        } else if (Array.isArray(data?.data)) {
          formatted = data.data;
        } else if (Array.isArray(data?.items)) {
          formatted = data.items;
        }

        setFilters(formatted);
      } catch (err: any) {
        console.error("Filter fetch error:", err);
        setError(err.message || "Failed to load filters");
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [categoryId]);

  const handleSelect = (code: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [code]: value,
    }));
  };

  const handleApply = () => {
    const query = new URLSearchParams();
    Object.entries(selected).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    const path = window.location.pathname;
    const queryString = query.toString();
    router.push(queryString ? `${path}?${queryString}` : path);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelected({});
    router.push(window.location.pathname);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle filters"
      >
        {isOpen ? <X size={24} /> : <Filter size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-full lg:w-64 bg-white shadow-lg lg:border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-50 lg:z-10 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex-none p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              Filter Products
            </h2>
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-white">

          {error && (
            <div className="p-3 mb-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-blue-600">Loading filters...</p>
            </div>
          )}

          {!loading && !error && filters?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">No options available</p>
            </div>
          )}

          {!loading && !error && Array.isArray(filters) && filters.map((category) => (
            <div key={category?.attribute_code} className="flex flex-col space-y-1.5 mb-2">
              <label
                htmlFor={`filter-${category?.attribute_code}`}
                className="text-sm font-semibold text-gray-700 block"
              >
                {category?.label}
              </label>

              <div className="relative">
                <select
                  id={`filter-${category?.attribute_code}`}
                  value={selected[category?.attribute_code] || ""}
                  onChange={(e) => handleSelect(category?.attribute_code, e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors cursor-pointer shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!Array.isArray(category?.options) || category.options.length === 0}
                >
                  <option value="">Select {category?.label}</option>

                  {Array.isArray(category?.options) && category.options.length > 0 && category.options.map((option) => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}

                  {(!Array.isArray(category?.options) || category.options.length === 0) && (
                    <option value="" disabled>No options available</option>
                  )}
                </select>

                {/* Custom Native Dropdown Arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed Action Buttons at Bottom */}
        {!loading && (
          <div className="flex-none p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleApply}
                disabled={error !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClear}
                disabled={error !== null}
                className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}