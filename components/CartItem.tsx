"use client";

import React, { useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { CartItem as CartItemType } from "@/modules/cart/hooks/useCart";
import Price from "@/app/components/Price";


interface CartItemProps {
    item: CartItemType;
    currencyCode: string;
    onUpdateQty: (id: number, qty: number) => void;
    onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, currencyCode, onUpdateQty, onRemove }) => {
    const [updating, setUpdating] = useState(false);

    const handleQtyChange = async (newQty: number) => {
        if (newQty < 1 || updating) return;
        setUpdating(true);
        try {
            await onUpdateQty(item.item_id, newQty);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="relative bg-white border-x border-b border-gray-200 hover:bg-gray-50/50 transition-all duration-300 group/item hover:shadow-inner">
            {/* Remove Button - always visible on mobile, hover on desktop */}
            <button
                onClick={() => {
                    if (window.confirm("Are you sure you want to remove this product?")) {
                        onRemove(item.item_id);
                    }
                }}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-500 text-gray-500 hover:text-white rounded-full transition-all z-10 cursor-pointer shadow-sm hover:scale-110 active:scale-95"
                title="Remove item"
            >
                <X size={14} />
            </button>

            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden p-4 pr-10">
                <div className="flex gap-3">
                    <div className="w-16 h-16 bg-white border border-gray-100 p-1 flex items-center justify-center rounded-sm flex-shrink-0">
                        <img src={item.image_url || "/images/tyre-sample.png"} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-black text-black leading-tight uppercase tracking-wide line-clamp-2">{item.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.size_display && <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase">Size: {item.size_display}</span>}
                            {item.pattern_display && <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase">Pattern: {item.pattern_display}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Price</span>
                        <span className="text-[13px] font-black text-gray-900 price currency-riyal"><Price amount={item.price} /></span>
                    </div>
                    <div className="flex items-center border-2 border-gray-100 p-0.5 bg-white">
                        <button onClick={() => handleQtyChange(item.qty - 1)} disabled={item.qty <= 1 || updating} className="w-7 h-7 flex items-center justify-center hover:bg-yellow-400 text-black transition-all disabled:opacity-20 cursor-pointer active:scale-90"><Minus size={12} strokeWidth={3} /></button>
                        <span className="w-8 h-7 flex items-center justify-center text-[12px] font-black text-black">{updating ? <span className="w-3 h-3 border-2 border-gray-200 border-t-yellow-400 rounded-full animate-spin" /> : item.qty}</span>
                        <button onClick={() => handleQtyChange(item.qty + 1)} disabled={updating} className="w-7 h-7 flex items-center justify-center hover:bg-yellow-400 text-black transition-all disabled:opacity-20 cursor-pointer active:scale-90"><Plus size={12} strokeWidth={3} /></button>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Total</span>
                        <span className="text-[14px] font-black text-black price currency-riyal"><Price amount={item.row_total} /></span>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center py-6 xl:py-8 px-4 lg:px-6">
                {/* Product: Image + Name (35%) */}
                <div className="w-[35%] flex items-center gap-4">
                    <div className="w-20 xl:w-28 h-20 xl:h-28 bg-white border border-gray-100 p-1.5 flex items-center justify-center shadow-sm group-hover/item:shadow-md transition-all rounded-sm flex-shrink-0">
                        <img src={item.image_url || "/images/tyre-sample.png"} alt={item.name} className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover/item:scale-110" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[13px] xl:text-[15px] font-black text-black leading-tight mb-2 uppercase tracking-wide">{item.name}</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {item.size_display && <span className="text-[9px] xl:text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded uppercase">Size: {item.size_display}</span>}
                            {item.pattern_display && <span className="text-[9px] xl:text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded uppercase">Pattern: {item.pattern_display}</span>}
                        </div>
                    </div>
                </div>

                {/* Price (20%) */}
                <div className="w-[20%] text-center">
                    <span className="text-[13px] xl:text-[15px] font-black text-gray-900 tracking-tight price currency-riyal"><Price amount={item.price} /></span>
                </div>

                {/* Qty (20%) */}
                <div className="w-[20%] flex justify-center items-center">
                    <div className="flex items-center border-2 border-gray-100 p-0.5 xl:p-1 bg-white focus-within:border-yellow-400 transition-all">
                        <button onClick={() => handleQtyChange(item.qty - 1)} disabled={item.qty <= 1 || updating} className="w-7 xl:w-8 h-7 xl:h-8 flex items-center justify-center hover:bg-yellow-400 text-black transition-all disabled:opacity-20 cursor-pointer active:scale-90"><Minus size={13} strokeWidth={3} /></button>
                        <span className="w-8 xl:w-10 h-7 xl:h-8 flex items-center justify-center text-[12px] xl:text-[13px] font-black text-black">{updating ? <span className="w-3 h-3 border-2 border-gray-200 border-t-yellow-400 rounded-full animate-spin" /> : item.qty}</span>
                        <button onClick={() => handleQtyChange(item.qty + 1)} disabled={updating} className="w-7 xl:w-8 h-7 xl:h-8 flex items-center justify-center hover:bg-yellow-400 text-black transition-all disabled:opacity-20 cursor-pointer active:scale-90"><Plus size={13} strokeWidth={3} /></button>
                    </div>
                </div>

                {/* Total (25%) */}
                <div className="w-[25%] text-center">
                    <span className="text-[14px] xl:text-[16px] font-black text-black tracking-tight price currency-riyal"><Price amount={item.row_total} /></span>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
