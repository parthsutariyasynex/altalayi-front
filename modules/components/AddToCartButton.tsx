"use client";

import { useCart } from "@/modules/cart/hooks/useCart";

export default function AddToCartButton({ itemId }: { itemId: number }) {
  const { addToCart } = useCart();

  return (
    <button onClick={() => addToCart(itemId, 1)}>
      Add To Cart
    </button>
  );
}