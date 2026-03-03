"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { ShoppingCart, X, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductDialog from "../components/ProductDialog";
import { fetchProducts, checkAuth } from "./api";
import { useCart } from "@/modules/cart/hooks/useCart";

// import Sidebar from "../components/Sidebar";

export default function ProductsPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<string>("none");

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ✅ Load Products */
  useEffect(() => {
    if (!checkAuth(router)) return;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetchProducts();
        console.log("API Response:", res);

        // Safely extract array
        const productArray = Array.isArray(res) ? res : (res as any)?.products || (res as any)?.data || [];
        setProducts(productArray);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "401") {
          localStorage.removeItem("token");
          router.replace("/login");
        } else {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [router]);

  /* ✅ Add To Cart */
  // const handleAddToCart = async (productId: number) => {
  //   try {
  //     await addToCart(productId, 1);
  //     alert("Added to cart");
  //   } catch (err: unknown) {
  //     if (err instanceof Error && err.message === "401") {
  //       localStorage.removeItem("token");
  //       router.replace("/login");
  //     } else {
  //       alert("Failed to add to cart");
  //     }
  //   }
  // };
  const handleAddToCart = async (sku: string) => {
    try {
      await addToCart(sku, 1);
      // alert("Added to cart");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "401") {
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        alert("Failed to add to cart");
      }
    }
  };

  /* ✅ Stock Badge Logic */

  const getStockBadge = (status: string) => {
    const baseStyle =
      "flex flex-col items-center justify-center text-center min-w-[90px]";

    const dotStyle =
      "w-4 h-4 min-w-[16px] min-h-[16px] rounded-full mb-1";

    switch (status?.toLowerCase()) {
      case "available":
      case "in stock":
        return (
          <div className={baseStyle}>
            <span className={`${dotStyle} bg-green-500`}></span>
            <span className="text-xs font-medium leading-tight">
              Available
            </span>
          </div>
        );

      case "out of stock":
        return (
          <div className={baseStyle}>
            <span className={`${dotStyle} bg-red-500`}></span>
            <span className="text-xs font-medium leading-tight">
              Not Available
            </span>
          </div>
        );

      case "limited":
        return (
          <div className={baseStyle}>
            <span className={`${dotStyle} bg-yellow-400`}></span>
            <span className="text-xs font-medium leading-tight">
              Limited
            </span>
          </div>
        );

      default:
        return (
          <div className={baseStyle}>
            <span className={`${dotStyle} bg-gray-400`}></span>
            <span className="text-xs font-medium leading-tight">
              {status || "Unknown"}
            </span>
          </div>
        );
    }
  };
  /* ✅ Format Price */
  const formatPrice = (price: number | string) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return "N/A";
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  /* ✅ Sorting Logic */
  const sortedProducts = useMemo(() => {
    if (sortBy === "price-asc") {
      return [...products].sort((a, b) => (a.price || a.final_price) - (b.price || b.final_price));
    }
    if (sortBy === "price-desc") {
      return [...products].sort((a, b) => (b.price || b.final_price) - (a.price || a.final_price));
    }
    return products;
  }, [products, sortBy]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        {/* <Sidebar /> */}

        <div className="flex-1">
          <div className="w-full mx-auto p-7">
            <div className="bg-white rounded-lg shadow-sm p-6 w-full">
              {/* Top Section */}
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => router.push("/favourites")}
                  className="flex items-center gap-2 bg-gray-300 hover:bg-gray-500 px-4 py-2 rounded-md border shadow"
                >
                  <Star size={18} fill="black" />
                  Favourite Products
                </button>

                <select
                  className="bg-gray-300 px-4 py-2 rounded-md border shadow"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="none">Sort By</option>
                  <option value="price-asc">Price Low - High</option>
                  <option value="price-desc">Price High - Low</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100 text-gray-700">
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
                        <td colSpan={9} className="text-center py-6 text-gray-500">
                          Loading products...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-red-500">
                          {error}
                        </td>
                      </tr>
                    ) : !Array.isArray(products) || sortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-gray-500">
                          No Products Available
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((product, index) => (
                        <tr key={product?.id || product?.product_id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{product?.brand || product?.name || "N/A"}</td>


                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">

                              {/* Size Text */}
                              <span
                                className="text-blue-600 underline cursor-pointer"
                                onClick={() => setSelectedProduct(product)}
                              >
                                {product?.size || product?.tyre_size || "N/A"}
                              </span>

                              {/* Info Icon */}
                              {/* <div
                                onClick={() => setSelectedProduct(product)}
                                className="w-5 h-5 flex items-center justify-center 
                                    rounded-full bg-black text-white text-xs 
                                    cursor-pointer hover:bg-gray-700 transition"
                              >
                                i
                              </div> */}
                              <div
                                onClick={() => setSelectedProduct(product)}
                                className="w-5 h-5 flex items-center justify-center 
                                rounded-full bg-black text-white text-[10px] 
                                cursor-pointer 
                                hover:bg-yellow-400 hover:text-black
                                transition-all duration-200"
                              >
                                i
                              </div>

                            </div>
                          </td>

                          <td className="px-4 py-3">{product?.pattern || "N/A"}</td>
                          <td className="px-4 py-3">{product?.year || "N/A"}</td>
                          <td className="px-4 py-3">{product?.origin || "N/A"}</td>


                          <td className="px-4 py-3">
                            {product?.image || product?.image_url ? (
                              <div className="relative group w-16 h-16 cursor-pointer">

                                {/* Product Image */}
                                <img
                                  src={product?.image || product?.image_url}
                                  alt={product?.brand || product?.name || "Product"}
                                  className="w-16 h-16 object-cover border rounded"
                                />

                                {/* Hover Overlay */}
                                {/* <div
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                                   flex items-center justify-center rounded transition"
                                  onClick={() => {
                                    setSelectedImage(product?.image || product?.image_url);
                                    setIsImageModalOpen(true);
                                  }}
                                >
                                  <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center shadow-md">
                                    +
                                  </div>
                                </div> */}

                                <div
                                  className="absolute inset-0 bg-black/50 opacity-0 
                                          group-hover:opacity-100 transition-all duration-300 
                                          flex items-center justify-center rounded"
                                  onClick={() => {
                                    setSelectedImage(product?.image || product?.image_url);
                                    setIsImageModalOpen(true);
                                  }}
                                >
                                  <div className="w-8 h-8 bg-yellow-400 rounded-full 
                                    flex items-center justify-center 
                                    text-black text-lg font-bold 
                                    scale-75 group-hover:scale-100 
                                    transition-all duration-300 shadow-lg"
                                  >
                                    +
                                  </div>
                                </div>

                              </div>
                            ) : null}
                          </td>

                          <td className="px-4 py-3">
                            {getStockBadge(product?.stock_status || (product?.stock_qty > 0 ? "Available" : "Out of Stock"))}
                          </td>

                          <td className="px-4 py-3 font-semibold">
                            {formatPrice(product?.price || product?.final_price)}
                          </td>

                          {/* <td className="px-4 py-3 flex items-center gap-3">
                            <ShoppingCart
                              size={18}
                              className="cursor-pointer hover:text-green-600"
                              onClick={() => handleAddToCart(product?.id || product?.product_id)}
                            />
                          </td> */}

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">

                              {/* Quantity Button */}
                              <button className="w-10 h-10 border border-gray-400 rounded-md text-sm font-medium">
                                1
                              </button>

                              {/* Add To Cart Button */}
                              <button
                                onClick={() =>
                                  handleAddToCart(product?.sku || product?.id || product?.product_id)
                                }
                                className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-md hover:bg-yellow-500 transition"
                              >
                                <ShoppingCart size={18} />
                              </button>

                              {/* Favourite Button */}
                              <button
                                className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-md hover:bg-yellow-500 transition"
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

            </div>
          </div>
        </div>
      </div>

      {/* Image Modal Popup */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-lg p-2 max-w-3xl max-h-[90vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 -right-2 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full"
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
      )}
    </div>
  );
}

