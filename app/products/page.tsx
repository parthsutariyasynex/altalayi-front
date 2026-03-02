"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { Star, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductDialog from "../components/ProductDialog";
import { fetchProducts, checkAuth } from "./api";
import { useCart } from "@/modules/cart/hooks/useCart";
// import SearchBySize from "../components/tyre/SearchBySize";
import Sidebar from "../components/Sidebar";
import type { Product } from "../../modules/types/product";

/* ✅ Product Type */
// type ApiProduct = {
//   product_id: number;
//   name: string;
//   tyre_size: string;
//   pattern: string;
//   year: string;
//   origin: string;
//   image_url: string;
//   stock_qty: number;
//   final_price: number;
// };

export default function ProductsPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("none");
  const [favourites, setFavourites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  /* ✅ Load Products */
  useEffect(() => {
    if (!checkAuth(router)) return;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data: Product[] = await fetchProducts();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "401") {
          localStorage.removeItem("token");
          router.replace("/login");
        } else {
          setError("Unable to load products");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [router]);

  /* ✅ Load favourites */
  useEffect(() => {
    const storedFav = localStorage.getItem("favourites");
    if (storedFav) {
      setFavourites(JSON.parse(storedFav));
    }
  }, []);

  /* ✅ Sorting */
  const sortedProducts = useMemo(() => {
    if (sortBy === "price-asc") {
      return [...products].sort((a, b) => a.final_price - b.final_price);
    }
    if (sortBy === "price-desc") {
      return [...products].sort((a, b) => b.final_price - a.final_price);
    }
    return products;
  }, [products, sortBy]);

  /* ✅ Toggle Favourite */
  const handleToggleFavourite = (productId: number) => {
    setFavourites((prev) => {
      let updated: number[];

      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
      } else {
        updated = [...prev, productId];
      }

      localStorage.setItem("favourites", JSON.stringify(updated));
      return updated;
    });
  };

  /* ✅ Add To Cart */
  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      alert("Added to cart");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "401") {
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        alert("Failed to add to cart");
      }
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

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
                    ) : sortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-gray-500">
                          No Products Found
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((product) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{product.name ?? "N/A"}</td>

                          <td
                            className="px-4 py-3 text-blue-600 underline cursor-pointer"
                            onClick={() => setSelectedProduct(product)}
                          >
                            {product.tyre_size}
                          </td>

                          <td className="px-4 py-3">{product.pattern}</td>
                          <td className="px-4 py-3">{product.year}</td>
                          <td className="px-4 py-3">{product.origin}</td>

                          {/* <td className="px-4 py-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-14 h-14 object-cover border rounded"
                            />
                          </td> */}

                          <td className="px-4 py-3">{product.stock_qty}</td>

                          <td className="px-4 py-3 font-semibold">
                            {formatPrice(product.final_price)}
                          </td>

                          <td className="px-4 py-3 flex items-center gap-3">
                            <Star
                              size={18}
                              className={`cursor-pointer ${favourites.includes(product.product_id)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-400"
                                }`}
                              onClick={() =>
                                handleToggleFavourite(product.product_id)
                              }
                            />

                            <ShoppingCart
                              size={18}
                              className="cursor-pointer hover:text-green-600"
                              onClick={() =>
                                handleAddToCart(product.product_id)
                              }
                            />
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

              {/* <SearchBySize /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}