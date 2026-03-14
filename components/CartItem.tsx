"use client";

import React from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface CartItemProps {
    item: {
        item_id: number;
        name: string;
        price: number;
        qty: number;
        image_url: string;
        product_url: string;
        size_display: string;
        pattern_display: string;
        row_total: number;
    };
    currencyCode: string;
    onUpdateQty: (id: number, qty: number) => void;
    onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, currencyCode, onUpdateQty, onRemove }) => {
    return (
        <div className="relative bg-white border border-gray-200 mb-[-1px]">
            {/* Remove Button - Top Right Circular */}
            <button
                onClick={() => {
                    if (window.confirm("Are you sure you want to remove this product?")) {
                        onRemove(item.item_id);
                    }
                }}
                className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center bg-[#e5e5e5] hover:bg-red-600 text-gray-600 hover:text-white rounded-full transition-all z-10 shadow-md border border-gray-100"
                title="Remove item"
            >
                <X size={14} />
            </button>

            <div className="flex flex-col md:flex-row items-center py-6 px-4 gap-4 md:gap-0">
                {/* Product Image */}
                <div className="w-full md:w-1/6 flex justify-center">
                    <div className="w-24 h-24 bg-white flex items-center justify-center">
                        <img
                            src={item.image_url || "/images/tyre-sample.png"}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>

                {/* Product Name & Details */}
                <div className="w-full md:w-2/6 px-4 text-center md:text-left">
                    <Link href={item.product_url || "#"} className="hover:text-yellow-600 transition-colors">
                        <h3 className="text-sm font-bold text-gray-800 leading-tight mb-1">
                            {item.name}
                        </h3>
                    </Link>
                    <div className="text-[11px] text-gray-500 font-medium space-y-0.5">
                        {item.size_display && <p>Size: {item.size_display}</p>}
                        {item.pattern_display && <p>Pattern: {item.pattern_display}</p>}
                    </div>
                </div>

                {/* Price Column */}
                <div className="w-full md:w-1/6 text-center">
                    <span className="text-xs text-gray-400 font-bold uppercase md:hidden mr-2">Price:</span>
                    <span className="text-sm font-bold text-gray-800 tracking-tight">
                        ﷼ {item.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Qty Column */}
                <div className="w-full md:w-1/6 flex justify-center items-center">
                    <span className="text-xs text-gray-400 font-bold uppercase md:hidden mr-4">Qty:</span>
                    <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => onUpdateQty(item.item_id, parseInt(e.target.value) || 1)}
                        className="w-16 h-10 border border-gray-300 text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                </div>

                {/* Total Column */}
                <div className="w-full md:w-1/6 text-center">
                    <span className="text-xs text-gray-400 font-bold uppercase md:hidden mr-2">Total:</span>
                    <span className="text-sm font-bold text-gray-800 tracking-tight">
                        ﷼ {item.row_total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
