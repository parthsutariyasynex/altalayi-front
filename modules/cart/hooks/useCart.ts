import { useEffect, useState, useCallback } from "react";
import { getSession } from "next-auth/react";

export interface CartItem {
  item_id: number;
  sku: string;
  name: string;
  price: number;
  qty: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  grand_total: number;
}

/* ── Helper: get NextAuth session token (same pattern as api-client.ts) ── */
async function getAuthToken(): Promise<string | null> {
  const session: any = await getSession();
  return session?.accessToken ?? null;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH CART ================= */

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();
      console.log("Cart API raw response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      // Normalize Magento kleverapi/cart response → Cart shape
      const items = Array.isArray(data.items) ? data.items
        : Array.isArray(data.cart?.items) ? data.cart.items
          : [];

      const subtotal =
        data.subtotal ??
        data.cart?.subtotal ??
        items.reduce((sum: number, i: CartItem) => sum + i.price * i.qty, 0);

      const grand_total = data.grand_total ?? data.cart?.grand_total ?? subtotal;

      setCart({ items, subtotal, grand_total });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ================= ADD ================= */

  const addToCart = async (sku: string, qty: number) => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sku, qty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add item");
      }

      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  /* ================= UPDATE ================= */

  const updateCartItem = async (itemId: number, qty: number) => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/cart/update/${itemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qty }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update cart");
      }

      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cart");
    }
  };

  /* ================= REMOVE ================= */

  const removeFromCart = async (itemId: number) => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove item");
      }

      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    }
  };

  return {
    cart,
    isLoading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    refetchCart: fetchCart,
  };
}