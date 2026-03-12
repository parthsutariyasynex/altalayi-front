"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { ShoppingCart, X, Star, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductDialog from "../components/ProductDialog";
import { checkAuth } from "./api";
import { useCart } from "@/modules/cart/hooks/useCart";
import SidebarFilter from "../components/SidebarFilter";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<string>("none");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<Record<string, { value: string; label: string }[]>>({});

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  /* ── Load Products ── */
  useEffect(() => {
    if (!checkAuth(router)) return;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Construct query parameters including filters
        const params = new URLSearchParams();
        params.append("categoryId", "5");
        params.append("page", String(currentPage));
        params.append("pageSize", String(PAGE_SIZE));

        // Add selected filters to parameters
        Object.entries(selectedFilters).forEach(([code, values]) => {
          values.forEach((value) => {
            params.append(code, value);
          });
        });

        const url = `/api/category-products?${params.toString()}`;
        const res = await fetch(url, { headers });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.replace("/login");
            return;
          }
          throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();
        console.log("API Response:", data);

        const productArray = data.products ?? data.items ?? [];
        const total = data.total_count ?? productArray.length;

        setProducts(productArray);
        setTotalCount(total);
      } catch (err: unknown) {
        setError("Unable to load products. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [router, currentPage, selectedFilters]);

  // Handle filter change from sidebar
  const handleFilterChange = (filters: Record<string, string[]>, labels: Record<string, { value: string; label: string }[]>) => {
    setSelectedFilters(filters);
    setSelectedFilterLabels(labels);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset to page 1 when filters/searchParams change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSelectedFilterLabels({});
    setCurrentPage(1);
  };

  /* ── Add To Cart ── */
  const handleAddToCart = async (sku: string) => {
    try {
      await addToCart(sku, 1);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "401") {
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        alert("Failed to add to cart");
      }
    }
  };

  /* ── Stock Badge (Redesigned) ── */
  const getStockBadge = (product: any) => {
    const baseStyle = "flex flex-col items-center justify-center text-center";
    const dotStyle = "w-3 h-3 rounded-full mb-1 border border-black/5";

    // Try to find quantity from various possible fields
    const qty = Number(product?.stock_qty ?? product?.qty ?? product?.quantity ?? 0);

    if (qty > 10) {
      return (
        <div className={baseStyle}>
          <span className={`${dotStyle} bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]`}></span>
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Available</span>
        </div>
      );
    }

    if (qty >= 1) {
      return (
        <div className={baseStyle}>
          <span className={`${dotStyle} bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.4)]`}></span>
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Limited</span>
        </div>
      );
    }

    return (
      <div className={baseStyle}>
        <span className={`${dotStyle} bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)]`}></span>
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Not Available</span>
      </div>
    );
  };

  /* ── Format Price ── */
  const formatPrice = (price: number | string) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return "N/A";
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  };

  /* ── Sorting (Client-side on the current page results) ── */
  const sortedProducts = useMemo(() => {
    const result = [...products];
    if (sortBy === "price-asc") return result.sort((a, b) => a.final_price - b.final_price);
    if (sortBy === "price-desc") return result.sort((a, b) => b.final_price - a.final_price);
    return result;
  }, [products, sortBy]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (!isMounted) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SidebarFilter
          onFilterChange={handleFilterChange}
          selectedFilters={selectedFilters}
        />

        <div className="flex-1 flex flex-col p-4 md:p-7 overflow-hidden">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 w-full flex flex-col h-full overflow-hidden border border-gray-200">

            {/* Top Section */}
            <div className="flex-shrink-0 flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => router.push("/favourites")}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-md border border-gray-300 shadow-sm transition-all duration-200 text-sm font-bold text-gray-700 cursor-pointer"
                >
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  Favourite Products
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort By:</span>
                  <select
                    className="bg-white px-4 py-2 rounded-md border border-gray-300 shadow-sm text-sm font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="none">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Chips */}
              {Object.keys(selectedFilters).length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 animate-in fade-in slide-in-from-top-1 duration-300">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-1">Active:</span>
                  {Object.entries(selectedFilterLabels).map(([groupCode, items]) => (
                    items.map((item, idx) => (
                      <div
                        key={`${groupCode}-${item.value}`}
                        className="flex items-center gap-1 bg-white border border-yellow-400 px-2 py-1 rounded-md shadow-sm group hover:border-red-400 transition-colors cursor-default"
                      >
                        <span className="text-[11px] font-bold text-gray-700">{item.label}</span>
                        <button
                          onClick={() => {
                            const newFilters = { ...selectedFilters };
                            const newLabels = { ...selectedFilterLabels };

                            // Remove specific value
                            newFilters[groupCode] = newFilters[groupCode].filter(v => v !== item.value);
                            newLabels[groupCode] = newLabels[groupCode].filter(i => i.value !== item.value);

                            if (newFilters[groupCode].length === 0) {
                              delete newFilters[groupCode];
                              delete newLabels[groupCode];
                            }

                            setSelectedFilters(newFilters);
                            setSelectedFilterLabels(newLabels);
                          }}
                          className="hover:text-red-500 text-gray-400 transition-colors cursor-pointer"
                          title={`Remove ${item.label}`}
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))
                  ))}
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider ml-auto flex items-center gap-1 cursor-pointer"
                  >
                    <X size={12} strokeWidth={3} />
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white relative border-collapse">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-20 shadow-sm outline outline-1 outline-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Brand</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Pattern</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Origin</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-7 h-7 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-500">Loading products...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-red-500">{error}</td>
                    </tr>
                  ) : sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-gray-500">No Products Available</td>
                    </tr>
                  ) : (
                    sortedProducts.map((product, index) => (
                      <tr key={product?.product_id || product?.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{product?.name || "N/A"}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-blue-600 underline cursor-pointer text-sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              {product?.tyre_size || "N/A"}
                            </span>
                            <div
                              onClick={() => setSelectedProduct(product)}
                              className="w-5 h-5 flex items-center justify-center rounded-full bg-black text-white text-[10px] cursor-pointer hover:bg-yellow-400 hover:text-black transition-all duration-200"
                            >
                              i
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm">{product?.pattern || "N/A"}</td>
                        <td className="px-4 py-3 text-sm">{product?.year || "N/A"}</td>
                        <td className="px-4 py-3 text-sm">{product?.origin || "N/A"}</td>

                        <td className="px-4 py-3">
                          {product?.image_url ? (
                            <div className="relative group w-16 h-16 cursor-pointer">
                              <img
                                src={product.image_url}
                                alt={product?.name || "Product"}
                                className="w-16 h-16 object-cover border rounded"
                              />
                              <div
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded"
                                onClick={() => {
                                  setSelectedImage(product.image_url);
                                  setIsImageModalOpen(true);
                                }}
                              >
                                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black text-lg font-bold scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">+</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No image</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {getStockBadge(product)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-gray-900">
                              {formatPrice(product?.final_price || product?.price || product?.regular_price)}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" className="w-10 h-10 border border-gray-400 rounded-md text-sm font-medium cursor-default">1</button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(product?.sku);
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-md hover:bg-yellow-500 transition cursor-pointer"
                            >
                              <ShoppingCart size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => e.preventDefault()}
                              className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-md hover:bg-yellow-500 transition cursor-pointer"
                            >
                              <Star size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <ProductDialog
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />

            {/* ── Pagination ── */}
            {!loading && totalCount > 0 && (
              <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 bg-white">

                {/* Record info */}
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-800">
                    {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)}
                  </span>
                  {" – "}
                  <span className="font-semibold text-gray-800">
                    {Math.min(currentPage * PAGE_SIZE, totalCount)}
                  </span>
                  {" of "}
                  <span className="font-semibold text-gray-800">{totalCount}</span>
                  {" products"}
                </p>

                {/* Page controls */}
                <div className="flex items-center gap-1">

                  {/* Prev */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 h-9 px-3 text-sm font-semibold rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "…" ? (
                        <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(item as number);
                          }}
                          className={`w-9 h-9 text-sm font-semibold rounded-md border transition-all cursor-pointer ${currentPage === item
                            ? "bg-yellow-400 border-yellow-400 text-black shadow-sm"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 h-9 px-3 text-sm font-semibold rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Next <ChevronRight size={15} />
                  </button>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-lg p-2 max-w-3xl max-h-[90vh] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 -right-2 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full cursor-pointer"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Expanded view"
              className="w-96 md:w-[32rem] lg:w-[40rem] h-auto max-h-[85vh] object-contain rounded"
            />
          </div>
        </div>
      )
      }
    </div >
  );
}
