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
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 border border-[#ebebeb] px-4 sm:px-6 lg:px-8 py-4 lg:py-6 rounded-md shadow-sm gap-4 lg:gap-6">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
                <Link
                    href="/products"
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all border border-black cursor-pointer rounded-md text-center active:scale-95"
                >
                    Continue Shopping
                </Link>
                <button
                    onClick={onClearCart}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all border border-[#ebebeb] cursor-pointer rounded-md active:scale-95"
                >
                    Clear Cart
                </button>
                <button
                    onClick={onUpdateCart}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all cursor-pointer rounded-md border border-yellow-500 active:scale-95 shadow-sm"
                >
                    Update Cart
                </button>
            </div>

            <div className="flex items-center gap-4 sm:ml-auto">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">
                        Total Items
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">
                        in Cart
                    </span>
                </div>
                <span className="text-3xl font-black text-black leading-none tracking-tighter">
                    {itemsCount}
                </span>
            </div>
        </div>
    );
};

export default CartActions;
