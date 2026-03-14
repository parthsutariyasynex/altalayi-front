"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { getSession } from "next-auth/react";

export interface CartItem {
  item_id: number;
  sku: string;
  name: string;
  price: number;
  qty: number;
  image_url?: string;
  product_url?: string;
  size_display?: string;
  pattern_display?: string;
  row_total?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  tax_label: string;
  grand_total: number;
  currency_code: string;
  items_count: number;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (sku: string, qty: number) => Promise<void>;
  updateCartItem: (itemId: number, qty: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

async function getAuthToken(): Promise<string | null> {
  const session: any = await getSession();
  return session?.accessToken ?? null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        // If no token, we can't fetch customer cart. 
        // For guest carts, we might need a different approach, 
        // but keeping it simple as per requirements.
        setCart(null);
        return;
      }

      const res = await fetch("/api/kleverapi/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();
      console.log("Cart API response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      // Normalize Magento kleverapi/cart response
      const items = Array.isArray(data.items) ? data.items
        : Array.isArray(data.cart?.items) ? data.cart.items
          : [];

      const subtotal = data.subtotal ?? data.cart?.subtotal ?? 0;
      const tax_amount = data.tax_amount ?? data.cart?.tax_amount ?? 0;
      const tax_label = data.tax_label ?? data.cart?.tax_label ?? "VAT";
      const grand_total = data.grand_total ?? data.cart?.grand_total ?? subtotal;
      const currency_code = data.currency_code ?? data.cart?.currency_code ?? "SAR";
      const items_count = data.items_count ?? items.reduce((sum: number, i: CartItem) => sum + i.qty, 0);

      setCart({ items, subtotal, tax_amount, tax_label, grand_total, currency_code, items_count });
    } catch (err) {
      console.error("Fetch Cart Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (sku: string, qty: number) => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/kleverapi/cart/add", {
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
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
      throw err;
    }
  };

  const updateCartItem = async (itemId: number, qty: number) => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      // Note: This URL might need fixing too, but focusing on Add to Cart flow
      const res = await fetch(`/api/kleverapi/cart/update/${itemId}`, {
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
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cart");
      throw err;
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/kleverapi/cart/remove/${itemId}`, {
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
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/kleverapi/cart/clear", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to clear cart");
      }

      await fetchCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear cart");
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refetchCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}