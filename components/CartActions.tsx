"use client";

import React from "react";
import Link from "next/link";

interface CartActionsProps {
    itemsCount: number;
    onClearCart: () => void;
    onUpdateCart: () => void;
}

const CartActions: React.FC<CartActionsProps> = ({ itemsCount, onClearCart, onUpdateCart }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-gray-200 border-t-0 p-4 shadow-sm">
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Link
                    href="/products"
                    className="px-8 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
                >
                    Continue Shopping
                </Link>
                <button
                    onClick={onClearCart}
                    className="px-8 py-2.5 bg-[#eeeeee] text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors border border-gray-300"
                >
                    Clear Cart
                </button>
                <button
                    onClick={onUpdateCart}
                    className="px-8 py-2.5 bg-[#f4b400] text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#e0a500] transition-colors shadow-sm"
                >
                    Update Shopping Cart
                </button>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
                    Total Qty
                </span>
                <span className="text-sm font-black text-gray-900">
                    {itemsCount}
                </span>
            </div>
        </div>
    );
};

export default CartActions;
