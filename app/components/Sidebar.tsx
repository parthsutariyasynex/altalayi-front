"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const categoryId = params?.id as string;

  const [filters, setFilters] = useState<FilterCategory[]>([]);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Fetch Filters
  useEffect(() => {
    if (!categoryId) return;

    const fetchFilters = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("customerToken");

        if (!token) {
          setError("User not logged in");
          return;
        }

        const res = await fetch(`/api/category-filters/${categoryId}`, {
          headers: {
            // Authorization: `Bearer ${token}`,
            Authorization: `Bearer YOUR_ADMIN_TOKEN`,
          },
        });

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();

console.log("FULL API RESPONSE:", data);
console.log("TYPE OF DATA:", typeof data);
console.log("IS ARRAY:", Array.isArray(data));
console.log("DATA KEYS:", Object.keys(data || {}));

        let formatted: FilterCategory[] = [];

        if (Array.isArray(data)) {
          formatted = data;
        } else if (Array.isArray(data?.data)) {
          formatted = data.data;
        } else if (Array.isArray(data?.filters)) {
          formatted = data.filters;
        }

        setFilters(formatted);
      } catch (err: unknown) {
        console.error("Fetch error:", err);
        setError("Failed to load filters");
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [categoryId]);

  // 🔽 Toggle Dropdown
  const toggleSection = (code: string) => {
    setOpenSections((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code]
    );
  };

  // ✅ Checkbox Change
  const handleCheckbox = (code: string, value: string) => {
    setSelected((prev) => {
      const current = prev[code] || [];

      return {
        ...prev,
        [code]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-white p-4 overflow-y-auto">
      <h2 className="mb-4 text-lg font-semibold">Filter Options</h2>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Empty */}
      {!loading && !error && filters.length === 0 && (
        <p className="text-sm text-gray-500">No filters found</p>
      )}

      {/* Filters */}
      {!loading &&
        !error &&
        filters.map((category) => (
          <div key={category.attribute_code} className="mb-4 border-b pb-2">

            {/* Dropdown Header */}
            <button
              onClick={() => toggleSection(category.attribute_code)}
              className="flex w-full items-center justify-between text-sm font-medium text-gray-800"
            >
              {category.label}
              <span>
                {openSections.includes(category.attribute_code) ? "-" : "+"}
              </span>
            </button>

            {/* Dropdown Content */}
            {openSections.includes(category.attribute_code) && (
              <div className="mt-2 space-y-2">
                {category.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selected[category.attribute_code]?.includes(option.value) || false
                      }
                      onChange={() =>
                        handleCheckbox(category.attribute_code, option.value)
                      }
                      className="h-4 w-4"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
    </aside>
  );
}