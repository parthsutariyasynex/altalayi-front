"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { ShoppingCart, X, Star, ChevronLeft, ChevronRight, ChevronDown, AlertTriangle, Info, Check, Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductDialog from "../components/ProductDialog";
import ProductEnquiryModal from "../components/ProductEnquiryModal";
import { checkAuth } from "./api";
import { useCart } from "@/modules/cart/hooks/useCart";
import SidebarFilter from "../components/SidebarFilter";
import HorizontalFilter from "../components/HorizontalFilter";
import Drawer from "../components/Drawer";
import Modal from "../components/Modal";
import { api } from "@/lib/api/api-client";
import { formatPrice, redirectToLogin, formatMagentoQueryParams, parseMagentoQueryParams } from "@/utils/helpers";
import Price from "../components/Price";

import { toast } from "react-hot-toast";

const PAGE_SIZE = 20;

const TABLE_HEADERS = ['Brand', 'Size', 'Pattern', 'Year', 'Origin', 'Image', 'Offer', 'Stock', 'Price', 'Action'] as const;
const SHIMMER_ROWS = 10;
const ROW_HEIGHT = 'h-[52px]';

function ShimmerRows() {
  return (
    <>
      {Array.from({ length: SHIMMER_ROWS }).map((_, i) => (
        <tr key={`shimmer-${i}`} className={`animate-pulse ${ROW_HEIGHT}`}>
          {TABLE_HEADERS.map((_, j) => (
            <td key={j} className="px-5">
              <div className="h-3 bg-gray-100 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function MobileCardShimmer() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 animate-pulse">
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-2.5 bg-gray-100 rounded w-16"></div>
              <div className="h-3.5 bg-gray-100 rounded w-32"></div>
              <div className="h-2.5 bg-gray-100 rounded w-24"></div>
              <div className="h-2.5 bg-gray-100 rounded w-20"></div>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
          </div>
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
            <div className="h-4 bg-gray-100 rounded w-16"></div>
            <div className="flex gap-1.5">
              <div className="h-9 w-20 bg-gray-100 rounded-lg"></div>
              <div className="h-9 w-9 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function ProductsShimmer() {
  return (
    <div className="flex flex-1">
      {/* Desktop sidebar shimmer */}
      <aside className="hidden md:flex w-[300px] flex-shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-hidden flex-col">
        <div className="flex border-b border-gray-200 h-[64px] md:h-[108px] flex-shrink-0 items-center px-6">
          <div className="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-24"></div>
              <div className="h-8 bg-gray-50 rounded w-full"></div>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col p-2 md:pt-4 md:pr-4 md:pb-28 md:pl-0">
        {/* Mobile shimmer */}
        <div className="md:hidden flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-[42px] bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-[42px] bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="h-[42px] bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-[42px] bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
          <MobileCardShimmer />
        </div>
        {/* Desktop shimmer */}
        <div className="hidden md:flex flex-col flex-1 bg-white md:rounded-r-2xl shadow-sm border border-gray-200 border-l-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center gap-4 min-h-[60px]">
            <div className="h-8 bg-gray-100 rounded-xl w-40 animate-pulse"></div>
            <div className="h-8 bg-gray-50 rounded-xl w-28 animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full border-separate border-spacing-0 table-fixed min-w-[900px]">
              <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
                <tr>
                  {TABLE_HEADERS.map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold text-black uppercase tracking-wider text-center border-b border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody><ShimmerRows /></tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 h-[52px]">
            <div className="h-3 bg-gray-100 rounded w-32 animate-pulse"></div>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsShimmer />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<string>("none");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<Record<string, { value: string; label: string }[]>>({});
  const [apiFilters, setApiFilters] = useState<any[] | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState<any | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favIds, setFavIds] = useState<number[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("favourites");
    if (stored) setFavIds(JSON.parse(stored));
    if (searchParams) {
      const { filters, page, sortBy } = parseMagentoQueryParams(searchParams);
      if (Object.keys(filters).length > 0) setSelectedFilters(filters);
      setCurrentPage(page);
      setSortBy(sortBy);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isMounted) return;
    const newUrlParams = formatMagentoQueryParams(selectedFilters, currentPage, sortBy);
    const currentUrlParams = searchParams.toString();
    if (newUrlParams !== currentUrlParams) {
      const newUrl = `${window.location.pathname}${newUrlParams ? `?${newUrlParams}` : ""}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedFilters, currentPage, sortBy, isMounted, router, searchParams]);

  const toggleFavorite = async (product: any) => {
    const { product_id: productId } = product;
    const stored = localStorage.getItem("favourites");
    const favIds: number[] = stored ? JSON.parse(stored) : [];
    if (!favIds.includes(productId)) {
      favIds.push(productId);
      localStorage.setItem("favourites", JSON.stringify(favIds));
      setFavIds(favIds);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        const toastId = toast.loading("Adding to favorites...");
        try {
          await api.post("/kleverapi/favorite-products", { product_id: productId });
          toast.success("Added to favorites", { id: toastId });
        } catch (err) {
          console.error("API favorite add error:", err);
          toast.error("Could not sync favorites", { id: toastId });
        }
      }
    }
    router.push("/favorites");
  };

  const [debouncedFilters, setDebouncedFilters] = useState(selectedFilters);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilters(selectedFilters), 500);
    return () => clearTimeout(handler);
  }, [selectedFilters]);

  useEffect(() => {
    const abortController = new AbortController();
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) { redirectToLogin(router); return; }
        const headers: HeadersInit = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
        const queryString = formatMagentoQueryParams(debouncedFilters, currentPage, sortBy);
        const url = `/api/category-products?${queryString}&categoryId=5&pageSize=${PAGE_SIZE}`;
        const res = await fetch(url, { headers, signal: abortController.signal });
        if (!res.ok) {
          if (res.status === 401) { localStorage.removeItem("token"); redirectToLogin(router); return; }
          throw new Error(`API Error: ${res.status}`);
        }
        const data = await res.json();
        const productArray = Array.isArray(data.products) ? data.products : (Array.isArray(data.items) ? data.items : []);
        const total = typeof data.total_count === "number" ? data.total_count : productArray.length;
        if (abortController.signal.aborted) return;
        setProducts(productArray);
        setTotalCount(total);
        if (data.filters) setApiFilters(data.filters);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Unable to load products. Please try again.");
        console.error(err);
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };
    loadProducts();
    return () => abortController.abort();
  }, [router, currentPage, debouncedFilters, sortBy]);

  const handleFilterChange = useCallback(
    (filters: Record<string, string[]>, labels: Record<string, { value: string; label: string }[]>) => {
      setSelectedFilters(filters);
      setSelectedFilterLabels(labels);
      setCurrentPage(1);
    }, [],
  );

  const clearAllFilters = () => { setSelectedFilters({}); setSelectedFilterLabels({}); setIsFavorite(false); setCurrentPage(1); };

  const removeSpecificFilter = (code: string, value: string) => {
    const nextFilters = { ...selectedFilters };
    nextFilters[code] = (nextFilters[code] || []).filter(v => v !== value);
    if (nextFilters[code].length === 0) delete nextFilters[code];
    const nextLabels = { ...selectedFilterLabels };
    if (nextLabels[code]) { nextLabels[code] = nextLabels[code].filter(l => l.value !== value); if (nextLabels[code].length === 0) delete nextLabels[code]; }
    setSelectedFilters(nextFilters);
    setSelectedFilterLabels(nextLabels);
    setCurrentPage(1);
  };

  const handleAddToCart = useCallback(async (sku: string) => {
    try {
      setAddingToCart(sku);
      await addToCart(sku, 1);
      toast.success("Product added to cart!");
      setJustAdded(sku);
      setTimeout(() => setJustAdded(null), 2000);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "401") {
        localStorage.removeItem("token");
        router.replace("/login");
      }
      else toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  }, [addToCart, router]);

  const getStockBadge = (product: any) => {
    const label = product?.stock_label || (product?.is_in_stock ? "Available" : "Not Available");
    const apiColor = product?.stock_color?.toLowerCase() || (product?.is_in_stock ? "green" : "red");
    const colorClass = apiColor === "green" ? "bg-green-500" : apiColor === "yellow" ? "bg-yellow-400" : "bg-red-500";
    return (
      <div className="flex flex-col items-center justify-center text-center gap-1">
        <span className={`w-4 h-4 rounded-full border border-gray-100 shadow-sm ${colorClass}`}></span>
        <span className="text-[10px] font-black text-gray-700 uppercase leading-none">{label}</span>
      </div>
    );
  };

  const sortedProducts = useMemo(() => {
    let result = [...products];
    if (isFavorite) result = result.filter(p => favIds.includes(p.product_id));
    const selectedOffers = selectedFilters["offers"];
    if (selectedOffers?.length) result = result.filter(p => p?.offer && selectedOffers.some((o: string) => o === p.offer));
    const sw = selectedFilters["width"]?.[0], sh = selectedFilters["height"]?.[0], sr = selectedFilters["rim"]?.[0];
    if (sw || sh || sr) {
      result = result.filter(p => {
        const m = String(p?.tyre_size || "").trim().match(/^(\d+)\/?(\d+)?\s*R?\s*(\d+\.?\d*)?/i);
        if (!m) return false;
        return (!sw || m[1] === sw) && (!sh || m[2] === sh) && (!sr || m[3] === sr);
      });
    }
    if (sortBy === "price-asc") return result.sort((a, b) => (a.final_price ?? 0) - (b.final_price ?? 0));
    if (sortBy === "price-desc") return result.sort((a, b) => (b.final_price ?? 0) - (a.final_price ?? 0));
    return result;
  }, [products, sortBy, isFavorite, favIds, selectedFilters]);

  const totalColumns = 10;
  const hasSizeFilter = selectedFilters["width"] || selectedFilters["height"] || selectedFilters["rim"];
  const displayCount = hasSizeFilter ? sortedProducts.length : totalCount;
  const totalPages = Math.ceil(displayCount / PAGE_SIZE);

  const handleHorizontalSearch = useCallback((width: string, height: string, rim: string) => {
    setSelectedFilters(prev => {
      const nf = { ...prev };
      if (width) nf["width"] = [width]; else delete nf["width"];
      if (height) nf["height"] = [height]; else delete nf["height"];
      if (rim) nf["rim"] = [rim]; else delete nf["rim"];
      return nf;
    });
    setSelectedFilterLabels(prev => {
      const nl = { ...prev };
      if (width) nl["width"] = [{ value: width, label: width }]; else delete nl["width"];
      if (height) nl["height"] = [{ value: height, label: height }]; else delete nl["height"];
      if (rim) nl["rim"] = [{ value: rim, label: rim }]; else delete nl["rim"];
      return nl;
    });
    setCurrentPage(1);
  }, []);

  /* ══════════════════════════════════════════════════════════════
     MOBILE PRODUCT CARD
  ══════════════════════════════════════════════════════════════ */
  const renderProductCard = (product: any, index: number) => {
    const brandName = product?.brand || (product?.name ? product.name.split(' ')[0] : "N/A");
    const isOutOfStock = product.stock_status === "Not Available" || Number(product?.stock_qty ?? 0) <= 0;
    const stockLabel = product?.stock_label || (product?.is_in_stock ? "Available" : "Not Available");
    const stockColor = product?.stock_color?.toLowerCase() || (product?.is_in_stock ? "green" : "red");
    const dotColor = stockColor === "green" ? "bg-green-500" : stockColor === "yellow" ? "bg-yellow-400" : "bg-red-500";

    return (
      <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col gap-2">
        {/* Top: content left + image right */}
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{brandName}</p>
            <p className="text-[13px] font-black text-gray-900 leading-tight mt-0.5 truncate">{product?.pattern || product?.name || "—"}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded font-medium">{product?.tyre_size || "—"}</span>
              {product?.origin && <span className="text-[11px] text-gray-500">{product.origin}</span>}
              {product?.year && <span className="text-[11px] text-gray-400 font-mono">{product.year}</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
              <span className="text-[10px] font-bold text-gray-600 uppercase">{stockLabel}</span>
            </div>
            {product?.offer && <p className="text-[10px] font-bold text-red-600 uppercase mt-1">{product.offer}</p>}
          </div>
          <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => { if (product?.image_url) { setSelectedImage(product.image_url); setPreviewProduct(product); setIsImageModalOpen(true); } }}>
            {product?.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" /> : <span className="text-[8px] text-gray-300 font-bold uppercase">No Img</span>}
          </div>
        </div>
        {/* Bottom: price left + actions right */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
          <span className="text-[14px] font-black text-black rubik-sans"><Price amount={product?.final_price || 0} /></span>
          <div className="flex items-center gap-1.5">
            {!isOutOfStock ? (
              <button onClick={() => handleAddToCart(product.sku)} disabled={addingToCart === product.sku} className={`h-9 px-4 rounded-lg flex items-center gap-1.5 text-[11px] font-black uppercase shadow-sm active:scale-95 cursor-pointer ${justAdded === product.sku ? "bg-green-500 text-white" : "bg-[#f5b21a] text-black"}`}>
                {addingToCart === product.sku ? <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : justAdded === product.sku ? <><Check size={14} strokeWidth={3} /> Added</> : <><ShoppingCart size={14} strokeWidth={2.5} /> Buy Now</>}
              </button>
            ) : (
              <button onClick={() => { setInquiryProduct(product); setIsInquiryModalOpen(true); }} className="h-9 px-4 bg-[#f5b21a] text-black rounded-lg flex items-center gap-1.5 text-[11px] font-black uppercase shadow-sm active:scale-95 cursor-pointer"><Info size={14} strokeWidth={2.5} /> Enquiry</button>
            )}
            <button onClick={() => toggleFavorite(product)} className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 cursor-pointer ${favIds.includes(product.product_id) ? "bg-[#f5b21a] text-black" : "bg-gray-100 text-gray-400"}`}>
              <Star size={16} fill={favIds.includes(product.product_id) ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════
     PAGINATION (shared)
  ══════════════════════════════════════════════════════════════ */
  const renderPagination = (compact = false) => {
    const show = !loading && displayCount > 0;
    return (
      <div className={`flex items-center justify-between ${compact ? 'py-3 px-1' : 'px-6 h-[52px] border-t border-gray-100 bg-gray-50/30'} ${show ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <span className={`font-black text-gray-400 uppercase tracking-widest ${compact ? 'text-[10px]' : 'text-[10px]'}`}>
          {compact ? `${displayCount} products` : <>Found <span className="text-gray-900">{displayCount}</span> Products</>}
        </span>
        <div className="flex items-center gap-1 md:gap-1.5">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`border border-gray-200 rounded-lg md:rounded-xl bg-white disabled:opacity-30 ${compact ? 'p-1.5' : 'p-2'}`}><ChevronLeft size={compact ? 14 : 16} /></button>
          {Array.from({ length: Math.min(5, totalPages || 1) }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`rounded-lg md:rounded-xl font-black ${compact ? 'w-8 h-8 text-[11px]' : 'w-9 h-9 text-xs'} ${currentPage === i + 1 ? "bg-[#f5b21a] text-black" : "bg-white text-gray-400 border border-gray-200"}`}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={`border border-gray-200 rounded-lg md:rounded-xl bg-white disabled:opacity-30 ${compact ? 'p-1.5' : 'p-2'}`}><ChevronRight size={compact ? 14 : 16} /></button>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block flex-shrink-0 sticky top-0 h-screen">
          <SidebarFilter
            onFilterChange={handleFilterChange}
            selectedFilters={selectedFilters}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            initialFilters={apiFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)}>
          <div className="flex flex-col h-full">
            <div className="bg-[#f5b21a] px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-[14px] font-black text-black uppercase tracking-tight">Filter Options</h2>
              {Object.keys(selectedFilters).length > 0 && (
                <button onClick={() => { clearAllFilters(); setIsMobileFilterOpen(false); }} className="text-[11px] font-bold text-black/70 uppercase underline">Clear All</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Render SidebarFilter content directly — override its aside wrapper via CSS */}
              <div className="[&>aside]:!w-full [&>aside]:!h-auto [&>aside]:!static [&>aside]:!border-0 [&>aside]:!overflow-visible [&>aside>div:first-child]:!hidden">
                <SidebarFilter onFilterChange={(f, l) => { handleFilterChange(f, l); setIsMobileFilterOpen(false); }} selectedFilters={selectedFilters} isCollapsed={false} setIsCollapsed={() => { }} initialFilters={apiFilters} />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-full h-[44px] bg-black text-white font-black uppercase text-[12px] tracking-widest rounded-lg active:scale-95 cursor-pointer">
                Apply Filters
              </button>
            </div>
          </div>
        </Drawer>

        {/* Mobile Search Drawer */}
        <Drawer isOpen={isMobileSearchOpen} onClose={() => setIsMobileSearchOpen(false)}>
          <div className="flex flex-col h-full">
            <div className="bg-[#f5b21a] px-5 py-4 flex-shrink-0">
              <h2 className="text-[14px] font-black text-black uppercase tracking-tight">Search by Tyre Size</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <HorizontalFilter vertical onSearch={(w, h, r) => { handleHorizontalSearch(w, h, r); setIsMobileSearchOpen(false); }} initialValues={{ width: debouncedFilters["width"]?.[0] || "", height: debouncedFilters["height"]?.[0] || "", rim: debouncedFilters["rim"]?.[0] || "" }} />
            </div>
          </div>
        </Drawer>

        <div className="flex-1 flex flex-col p-2 md:pt-4 md:pr-4 md:pb-28 md:pl-0">

          {/* ── MOBILE CONTROLS ── */}
          <div className="md:hidden flex flex-col gap-2 mb-3">
            {/* Row 1: Favourites + Search */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => router.push("/favorites")} className="h-[44px] bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer">
                <Star className="w-4 h-4 fill-black text-black" /> Favourites
              </button>
              <button onClick={() => setIsMobileSearchOpen(true)} className="h-[44px] bg-[#f5b21a] rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
            {/* Row 2: Sort + Filter */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setIsMobileSortOpen(true)} className="h-[44px] bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer">
                <ChevronDown className="w-4 h-4" />
                {sortBy === "none" ? "Sort By" : sortBy === "price-asc" ? "Price: Low" : "Price: High"}
              </button>
              <button onClick={() => setIsMobileFilterOpen(true)} className="h-[44px] bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer">
                <Filter className="w-4 h-4" /> Filter
                {Object.keys(selectedFilters).length > 0 && <span className="w-5 h-5 bg-[#f5b21a] rounded-full text-[10px] font-black flex items-center justify-center">{Object.keys(selectedFilters).length}</span>}
              </button>
            </div>
            {/* Active filter chips */}
            {Object.keys(selectedFilterLabels).length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar-hide py-1">
                {Object.entries(selectedFilterLabels).flatMap(([code, items]) => items.map((item) => (
                  <div key={`${code}-${item.value}`} className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-700 whitespace-nowrap flex-shrink-0">
                    {item.label} <button onClick={() => removeSpecificFilter(code, item.value)} className="text-gray-400"><X size={12} /></button>
                  </div>
                )))}
                <button onClick={clearAllFilters} className="text-[10px] font-black text-red-500 uppercase whitespace-nowrap flex-shrink-0 px-2">Clear</button>
              </div>
            )}
          </div>

          {/* Mobile Sort Bottom Sheet */}
          {isMobileSortOpen && (
            <div className="md:hidden fixed inset-0 z-[100]">
              <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileSortOpen(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-[14px] font-black uppercase tracking-tight">Sort By</h3>
                  <button onClick={() => setIsMobileSortOpen(false)} className="p-1 text-gray-400 hover:text-black"><X size={20} /></button>
                </div>
                <div className="flex flex-col py-2">
                  {[
                    { value: "none", label: "Default" },
                    { value: "price-asc", label: "Price: Low to High" },
                    { value: "price-desc", label: "Price: High to Low" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setIsMobileSortOpen(false); }}
                      className={`px-5 py-3.5 text-[13px] font-bold text-left flex items-center justify-between transition-colors ${sortBy === opt.value ? "bg-[#f5b21a]/10 text-black" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      {opt.label}
                      {sortBy === opt.value && <Check size={18} className="text-[#f5b21a]" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
                <div className="h-[env(safe-area-inset-bottom,0px)]" />
              </div>
            </div>
          )}

          {/* ── MOBILE CARD LIST ── */}
          <div className="md:hidden flex-1 flex flex-col gap-2.5 overflow-y-auto">
            {loading ? <MobileCardShimmer /> : sortedProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-20"><p className="text-xs font-black text-gray-400 uppercase tracking-widest">No products found</p></div>
            ) : sortedProducts.map((p, i) => renderProductCard(p, i))}
          </div>
          <div className="md:hidden">{renderPagination(true)}</div>

          {/* ── DESKTOP CONTROLS + TABLE ── */}
          <div className="hidden md:flex flex-col flex-1 bg-white rounded-none md:rounded-r-2xl shadow-sm border border-gray-200 border-l-0 overflow-hidden">
            {/* Desktop header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center gap-4 min-h-[60px]">
              <div className="flex items-center gap-4">
                <button onClick={() => router.push("/favorites")} className="bg-gray-50 border border-gray-200 text-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm text-xs font-bold active:scale-95 cursor-pointer uppercase tracking-wider">
                  <Star className="w-5 h-5 fill-black text-black" /> Favorite products
                </button>
                <div className="flex flex-1 items-center gap-2 overflow-x-auto custom-scrollbar-hide max-w-[800px]">
                  {isFavorite && (
                    <div className="flex items-center gap-1.5 bg-yellow-400 border border-yellow-500 px-3 py-1.5 rounded-full text-[12px] font-bold text-black shadow-sm flex-shrink-0">
                      Favorites <button onClick={() => setIsFavorite(false)} className="hover:text-red-700"><X size={14} /></button>
                    </div>
                  )}
                  {Object.entries(selectedFilterLabels).flatMap(([code, items]) => items.map((item) => (
                    <div key={`${code}-${item.value}`} className="flex items-center gap-1 bg-white border border-gray-200 px-4 py-2 rounded-full text-[12px] font-bold text-gray-700 shadow-sm whitespace-nowrap flex-shrink-0">
                      {item.label} <button onClick={() => removeSpecificFilter(code, item.value)} className="hover:text-red-500 text-gray-400"><X size={14} strokeWidth={2.5} /></button>
                    </div>
                  )))}
                </div>
                {Object.keys(selectedFilters).length > 0 && (
                  <button onClick={clearAllFilters} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-full flex-shrink-0"><X size={12} strokeWidth={3} /> Clear</button>
                )}
              </div>
              <select className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 outline-none cursor-pointer shadow-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="none">Sort By</option>
                <option value="price-asc">Price: Low-High</option>
                <option value="price-desc">Price: High-Low</option>
              </select>
            </div>

            {/* Desktop table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full border-separate border-spacing-0 table-fixed min-w-[900px]">
                <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                  <tr>
                    {TABLE_HEADERS.map(h => (
                      <th key={h} className={`px-5 py-3 text-[11px] font-bold text-black uppercase tracking-wider text-center border-b border-gray-100${h === 'Action' ? ' min-w-[120px]' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? <ShimmerRows /> : products.length === 0 ? (
                    <tr><td colSpan={totalColumns} className="py-24 text-center"><p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">No products matched your search</p></td></tr>
                  ) : sortedProducts.map((product, index) => {
                    const brandName = product?.brand || (product?.name ? product.name.split(' ')[0] : "N/A");
                    const isOutOfStock = product.stock_status === "Not Available" || Number(product?.stock_qty ?? 0) <= 0;
                    return (
                      <tr key={index} className={`hover:bg-gray-50/50 transition-colors group ${ROW_HEIGHT}`}>
                        <td className="px-5 text-[12px] font-normal text-gray-700 text-center">{brandName}</td>
                        <td className="px-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[12px] font-normal text-gray-900 tracking-tight">{product?.tyre_size}</span>
                            <div onClick={() => setSelectedProduct(product)} className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-[9px] font-bold text-white cursor-pointer hover:bg-yellow-400 hover:text-black transition-all shadow-sm">i</div>
                          </div>
                        </td>
                        <td className="px-5 text-[12px] font-normal text-gray-600 text-center">{product?.pattern || "—"}</td>
                        <td className="px-5 text-[12px] font-normal text-gray-500 text-center font-mono">{product?.year || "—"}</td>
                        <td className="px-5 text-[12px] font-normal text-gray-600 text-center">{product?.origin || "—"}</td>
                        <td className="px-5 text-center">
                          <div className="w-10 h-10 mx-auto">
                            {product?.image_url ? (
                              <div className="relative w-10 h-10 group/img cursor-pointer" onClick={() => { setSelectedImage(product.image_url); setPreviewProduct(product); setIsImageModalOpen(true); }}>
                                <img src={product.image_url} alt={product.name} width={40} height={40} className="w-10 h-10 object-contain rounded border border-gray-100 shadow-sm" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center rounded">
                                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-[10px] shadow-lg transform scale-50 group-hover/img:scale-100 transition-transform duration-300">+</div>
                                </div>
                              </div>
                            ) : <span className="text-[10px] text-gray-300 font-black uppercase leading-[40px]">No Image</span>}
                          </div>
                        </td>
                        <td className="px-5 text-center">{product.offer ? <span className="text-red-600 font-bold text-[10px] uppercase tracking-tight block max-w-[150px] mx-auto">{product.offer}</span> : <span className="text-gray-200">—</span>}</td>
                        <td className="px-5 text-center">{getStockBadge(product)}</td>
                        <td className="px-5 text-center whitespace-nowrap"><span className="text-[12px] font-black text-black tracking-tight rubik-sans"><Price amount={product?.final_price || 0} /></span></td>
                        <td className="px-5 text-center min-w-[120px]">
                          <div className="grid grid-cols-3 gap-1.5 justify-items-center">
                            {!isOutOfStock ? <div className="w-9 h-9 border-2 border-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-900 bg-white shadow-sm">1</div> : <div className="w-9 h-9" />}
                            {!isOutOfStock ? (
                              <button onClick={() => handleAddToCart(product.sku)} disabled={addingToCart === product.sku} className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${justAdded === product.sku ? "bg-green-500 text-white" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}>
                                {addingToCart === product.sku ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : justAdded === product.sku ? <Check size={18} strokeWidth={3} /> : <ShoppingCart size={18} strokeWidth={2.5} />}
                              </button>
                            ) : (
                              <button onClick={() => { setInquiryProduct(product); setIsInquiryModalOpen(true); }} className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg flex items-center justify-center shadow-md active:scale-95 cursor-pointer"><Info size={18} strokeWidth={2.5} /></button>
                            )}
                            <button onClick={() => toggleFavorite(product)} className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md active:scale-95 cursor-pointer ${favIds.includes(product.product_id) ? "bg-yellow-400 text-black" : "bg-white text-gray-400 border border-gray-100 hover:border-yellow-200"}`}>
                              <Star size={18} fill={favIds.includes(product.product_id) ? "currentColor" : "none"} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </div>
        </div>

        {/* Desktop bottom search bar */}
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-[40] bg-white border-t-[4px] border-[#f5a623] shadow-[0_-10px_30px_rgba(0,0,0,0.12)] h-[90px] items-center" style={{ paddingRight: 'var(--removed-body-scroll-bar-size, 0px)' }}>
          <div className={`w-full transition-all duration-300 ${isSidebarCollapsed ? "pl-[50px]" : "pl-[300px]"}`}>
            <div className="w-full max-w-[1400px] mx-auto px-4">
              <HorizontalFilter onSearch={handleHorizontalSearch} initialValues={{ width: debouncedFilters["width"]?.[0] || "", height: debouncedFilters["height"]?.[0] || "", rim: debouncedFilters["rim"]?.[0] || "" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductDialog product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
      <ProductEnquiryModal isOpen={isInquiryModalOpen} productSku={inquiryProduct?.sku || ""} productName={inquiryProduct?.name || ""} productPrice={inquiryProduct?.final_price || 0} onClose={() => { setIsInquiryModalOpen(false); setInquiryProduct(null); }} />
      <Drawer isOpen={isImageModalOpen && !!selectedImage} onClose={() => setIsImageModalOpen(false)}>
        <div className="flex flex-col h-full bg-white">
          <div className="bg-[#FFB82B] px-4 md:px-8 py-4 md:py-6 flex items-center justify-center flex-shrink-0">
            <h2 className="text-[14px] md:text-[17px] font-black text-black text-center uppercase tracking-tight">
              {previewProduct ? `${previewProduct?.pattern || '-'} - ${previewProduct?.tyre_size || '-'}` : "Product Preview"}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="bg-white flex items-center justify-center min-h-[200px] md:min-h-[400px] w-full">
              <img src={selectedImage} alt={previewProduct ? `${previewProduct?.pattern} - ${previewProduct?.tyre_size}` : "Product Preview"} className="max-w-full max-h-[60vh] md:max-h-[75vh] object-contain rounded-lg" />
            </div>
            <button onClick={() => setIsImageModalOpen(false)} className="mt-6 w-full py-3 md:py-4 bg-black text-white font-black uppercase tracking-widest rounded shadow-xl hover:bg-gray-800 text-sm cursor-pointer active:scale-95">Close Preview</button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
