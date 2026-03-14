"use client";

import React, { useState, useEffect } from "react";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import CartActions from "./CartActions";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/modules/cart/hooks/useCart";
import toast from "react-hot-toast";

import { getSession } from "next-auth/react";

const CartPage: React.FC = () => {
    const { cart, isLoading, error, removeFromCart, updateCartItem, clearCart, refetchCart } = useCart();

    const handleUpdateQty = async (id: number, qty: number) => {
        try {
            await updateCartItem(id, qty);
        } catch (err) {
            toast.error("Failed to update product quantity");
        }
    };

    const handleRemove = async (id: number) => {
        try {
            await removeFromCart(id);
            toast.success("Product removed from cart");
        } catch (err) {
            toast.error("Failed to remove product from cart");
        }
    };

    const handleUpdateCart = () => {
        refetchCart();
    };

    const handleClearCart = async () => {
        if (confirm("Clear all items from your cart?")) {
            try {
                await clearCart();
                toast.success("Cart cleared successfully");
            } catch (err) {
                toast.error("Failed to clear cart");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">Error loading cart</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={refetchCart} className="bg-black text-white px-6 py-2 rounded font-bold">Try Again</button>
            </div>
        );
    }

    const hasItems = cart && cart.items && cart.items.length > 0;

    if (!hasItems) {
        return (
            <div className="bg-white min-h-screen">
                <Navbar />
                <div className="max-w-7xl mx-auto py-24 px-6 text-center">
                    <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-widest mb-4">
                        No products in cart
                    </h1>
                    <Link href="/products" className="inline-flex items-center gap-2 text-yellow-600 font-bold hover:underline">
                        Go to products page
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto py-10 px-6">
                {/* Page Title */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">
                        Shopping Cart
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Side: Cart Items */}
                    <div className="lg:col-span-3">
                        {/* Table Header */}
                        <div className="hidden md:flex bg-[#f5f5f5] border border-gray-200 border-b-0 items-center py-4 px-4">
                            <div className="w-1/6 text-xs font-bold text-gray-800">Item</div>
                            <div className="w-2/6"></div>
                            <div className="w-1/6 text-xs font-bold text-gray-800 text-center">Price</div>
                            <div className="w-1/6 text-xs font-bold text-gray-800 text-center">Qty</div>
                            <div className="w-1/6 text-xs font-bold text-gray-800 text-center">Item(s) Total:</div>
                        </div>

                        {/* Cart Rows */}
                        <div className="flex flex-col">
                            {cart.items.map((item: any) => (
                                <CartItem
                                    key={item.item_id}
                                    item={item}
                                    currencyCode={cart.currency_code}
                                    onUpdateQty={handleUpdateQty}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>

                        {/* Cart Actions Toolbar */}
                        <CartActions
                            itemsCount={cart.items_count}
                            onClearCart={handleClearCart}
                            onUpdateCart={handleUpdateCart}
                        />

                        {/* Multiple Address Section Bar */}
                        <div className="mt-10 flex flex-col md:flex-row items-center justify-between border border-gray-200 bg-white shadow-sm">
                            <div className="py-4 px-6 text-[11px] font-bold text-gray-700 uppercase tracking-tight">
                                Do you want to ship the order to Multiple Addresses?
                            </div>
                            <button className="bg-[#f4b400] text-black font-bold py-4 px-10 uppercase tracking-widest text-[11px] hover:bg-[#e0a500] transition-colors whitespace-nowrap">
                                Multiple Location Delivery
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Summary */}
                    <div className="lg:col-span-1">
                        <CartSummary
                            subtotal={cart.subtotal}
                            taxAmount={cart.tax_amount}
                            taxLabel={cart.tax_label}
                            grandTotal={cart.grand_total}
                            currencyCode={cart.currency_code}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
