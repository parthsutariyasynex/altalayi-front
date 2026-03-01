import { useEffect, useState, useCallback } from "react";

export interface CartItem {
  item_id: number;
  name: string;
  price: number;
  qty: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  grand_total: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();

      // handle both {cart:{}} and direct object
      setCart(data.cart ?? data);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ✅ ADD
  const addToCart = async (itemId: number, qty: number) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id: itemId, qty }),
      });

      if (!res.ok) throw new Error("Failed to add item");

      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  // ✅ UPDATE
  const updateCartItem = async (itemId: number, qty: number) => {
    try {
      const token = getToken();

      await fetch("/api/cart/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id: itemId, qty }),
      });

      await fetchCart();
    } catch {
      setError("Failed to update cart");
    }
  };

  // ✅ REMOVE
  const removeFromCart = async (itemId: number) => {
    try {
      const token = getToken();

      await fetch(`/api/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchCart();
    } catch {
      setError("Failed to remove item");
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