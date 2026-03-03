"use client";

import { useCart } from "@/modules/cart/hooks/useCart";
import type { CartItem } from "@/modules/cart/hooks/useCart";
import Link from "next/link";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

/* ─────────────────────────── helpers ─────────────────────────── */

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(amount);

/* ─────────────────────────── Component ─────────────────────────── */

export default function CartPage() {
  const { cart, isLoading, error, removeFromCart, updateCartItem } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Record<number, boolean>>({});

  const hasItems = !!cart?.items && Array.isArray(cart.items) && cart.items.length > 0;

  /* ── Quantity Change ── */
  const handleQuantityChange = async (itemId: number, newQty: number): Promise<void> => {
    if (newQty < 1) {
      await handleRemoveItem(itemId);
      return;
    }
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await updateCartItem(itemId, newQty);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  /* ── Remove Item ── */
  const handleRemoveItem = async (itemId: number): Promise<void> => {
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error("Remove failed:", err);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your cart…</p>
        </div>
      </>
    );
  }

  /* ── Empty Cart ── */
  if (!hasItems) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-md w-full">
            <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg transition"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  /* ── Main Cart ── */
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Page Header ── */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="mt-1 text-gray-500">
                {cart!.items.length} item{cart!.items.length !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Cart Table ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4 text-left">Product</th>
                        <th className="px-4 py-4 text-center">Price</th>
                        <th className="px-4 py-4 text-center">Quantity</th>
                        <th className="px-4 py-4 text-right">Subtotal</th>
                        <th className="px-4 py-4 text-center">Remove</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {cart!.items.map((item: CartItem) => (
                        <tr
                          key={item.item_id}
                          className={`hover:bg-gray-50 transition-colors ${updatingItems[item.item_id] ? "opacity-50 pointer-events-none" : ""
                            }`}
                        >
                          {/* Product Name + SKU */}
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900 leading-tight">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.sku}</p>
                          </td>

                          {/* Unit Price */}
                          <td className="px-4 py-4 text-center">
                            <span className="font-medium text-green-600">{formatPrice(item.price)}</span>
                          </td>

                          {/* Quantity Stepper */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-0 border border-gray-300 rounded-lg overflow-hidden w-fit mx-auto">
                              <button
                                onClick={() => handleQuantityChange(item.item_id, item.qty - 1)}
                                className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-lg font-bold text-gray-600 transition"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <div className="w-10 h-9 flex items-center justify-center font-semibold text-gray-900 border-x border-gray-300 text-sm">
                                {item.qty}
                              </div>
                              <button
                                onClick={() => handleQuantityChange(item.item_id, item.qty + 1)}
                                className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-lg font-bold text-gray-600 transition"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Row Subtotal */}
                          <td className="px-4 py-4 text-right">
                            <span className="font-bold text-gray-900">{formatPrice(item.price * item.qty)}</span>
                          </td>

                          {/* Remove */}
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.item_id)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart!.items.length} items)</span>
                  <span className="font-medium text-gray-900">{formatPrice(cart?.subtotal ?? 0)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-500">Calculated at checkout</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Grand Total</span>
                  <span className="font-bold text-green-600 text-xl">{formatPrice(cart?.grand_total ?? 0)}</span>
                </div>
              </div>

              <button className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                Proceed to Checkout
              </button>

              <Link
                href="/products"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 font-medium py-3 px-6 rounded-lg transition text-sm"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}