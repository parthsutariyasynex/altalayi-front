import { useState } from "react";

interface CartItem {
  item_id: number;
  image?: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  grand_total: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    grand_total: 0,
  });

  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const removeFromCart = async (itemId: number) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.item_id !== itemId),
    }));
  };

  const updateCartItem = async (itemId: number, qty: number) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.item_id === itemId ? { ...item, qty } : item
      ),
    }));
  };

  return { cart, isLoading, error, removeFromCart, updateCartItem };
}