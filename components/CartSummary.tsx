"use client";

import React from "react";

interface CartSummaryProps {
    subtotal: number;
    taxAmount: number;
    taxLabel: string;
    grandTotal: number;
    currencyCode: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, taxAmount, taxLabel, grandTotal, currencyCode }) => {
    return (
        <div className="flex flex-col gap-6">
            {/* Summary Section */}
            <div className="bg-[#f5f5f5] rounded-sm overflow-hidden border border-gray-200 shadow-sm">
                <div className="bg-[#e5e5e5] p-3 border-b border-gray-300">
                    <h2 className="text-sm font-bold text-gray-800 text-center uppercase tracking-widest">
                        Summary
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-700 font-bold uppercase tracking-tight">Item(s) Total:</span>
                        <span className="font-bold text-gray-800">
                            ﷼ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-700 font-bold uppercase tracking-tight">
                            {taxLabel || "VAT"}:
                        </span>
                        <span className="font-bold text-gray-800">
                            ﷼ {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-gray-300 pt-4">
                        <span className="text-gray-800 font-bold uppercase tracking-widest">Grand Total:</span>
                        <span className="font-bold text-gray-900 text-base">
                            ﷼ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <button className="w-full mt-2 py-3 bg-[#f4b400] text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#e0a500] transition-colors shadow-sm">
                        Proceed to Checkout
                    </button>
                </div>
            </div>

            {/* Discount Codes Section */}
            <div className="bg-[#f5f5f5] rounded-sm overflow-hidden border border-gray-200 shadow-sm">
                <div className="bg-[#e5e5e5] p-3 border-b border-gray-300">
                    <h2 className="text-sm font-bold text-gray-800 text-center uppercase tracking-widest">
                        Discount Codes
                    </h2>
                </div>
                <div className="p-6">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-3">Enter your coupon code if you have one.</p>
                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder=""
                            className="w-full h-10 border border-gray-300 bg-white px-3 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />
                        <button className="w-full py-2.5 bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-300 transition-colors border border-gray-300">
                            Apply Coupon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
