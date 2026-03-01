"use client";

import { useCart } from "@/modules/cart/hooks";
import { formatPrice } from "@/utils/helpers";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface CartItem {
  item_id: number;
  image?: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
}

export default function CartPage() {
  const { cart, isLoading, error, removeFromCart, updateCartItem } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Record<number, boolean>>(
    {}
  );

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    if (newQty < 1) {
      await handleRemoveItem(itemId);
      return;
    }

    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      await updateCartItem(itemId, newQty);
    } catch (err) {
      console.error("Failed to update item:", err);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  const hasItems = cart?.items && cart.items.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mt-2 text-gray-600">
          You have {cart?.items?.length ?? 0} item
          {cart?.items?.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {hasItems ? (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
              {cart!.items.map((item: CartItem) => (
                <div
                  key={item.item_id}
                  className="flex gap-4 border-b pb-4 last:border-b-0"
                >
                  {/* Image */}
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.sku}</p>
                    <p className="mt-2 font-bold text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.item_id, item.qty - 1)
                      }
                      disabled={updatingItems[item.item_id]}
                      className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.item_id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={updatingItems[item.item_id]}
                      className="w-12 rounded border border-gray-300 px-2 py-1 text-center disabled:opacity-50"
                    />

                    <button
                      onClick={() =>
                        handleQuantityChange(item.item_id, item.qty + 1)
                      }
                      disabled={updatingItems[item.item_id]}
                      className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Total + Remove */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(item.price * item.qty)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.item_id)}
                      disabled={updatingItems[item.item_id]}
                      className="mt-2 text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <p className="mb-4 text-gray-600">Your cart is empty</p>
              <Link
                href="/products"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Summary */}
        {hasItems && (
          <div className="h-fit rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900">
              Order Summary
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(cart!.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">TBD</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  {formatPrice(
                    (cart!.grand_total || 0) - (cart!.subtotal || 0)
                  )}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(cart!.grand_total || 0)}
                  </span>
                </div>
              </div>
            </div>

            <button
              disabled={!hasItems}
              className="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}