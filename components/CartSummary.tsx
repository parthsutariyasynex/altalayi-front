"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Price from "@/app/components/Price";

interface CartSummaryProps {
    subtotal: number;
    taxAmount: number;
    taxLabel: string;
    grandTotal: number;
    currencyCode: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, taxAmount, taxLabel, grandTotal, currencyCode }) => {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Summary Section */}
            <div className="bg-white border border-[#ebebeb] rounded-md shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-[#ebebeb]">
                    <h2 className="text-xs font-black text-black text-center uppercase tracking-widest">
                        Summary
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-black text-[11px] uppercase tracking-widest">Subtotal</span>
                        <span className="font-black text-black text-xs tracking-tight">
                            <Price amount={subtotal} />
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-black text-[11px] uppercase tracking-widest">
                            {taxLabel || "VAT (15%)"}
                        </span>
                        <span className="font-black text-black text-xs tracking-tight">
                            <Price amount={taxAmount} />
                        </span>
                    </div>

                    <div className="pt-4 border-t border-[#ebebeb] flex justify-between items-center">
                        <span className="text-black font-black text-[13px] uppercase tracking-tight">Grand Total</span>
                        <span className="font-black text-black text-[16px] tracking-tighter">
                            <Price amount={grandTotal} />
                        </span>
                    </div>
                </div>
            </div>

            {/* Discount Codes Section */}
            <div className="bg-white border border-[#ebebeb] rounded-md shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-[#ebebeb]">
                    <h2 className="text-xs font-black text-black text-center uppercase tracking-widest">
                        Discount Codes
                    </h2>
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Enter discount code"
                            className="w-full px-4 py-3 text-xs font-bold text-black bg-white border border-[#ebebeb] rounded-md focus:border-yellow-400 focus:outline-none transition-colors placeholder:text-gray-300"
                        />
                        <button className="w-full bg-black text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 active:scale-95 transition-all cursor-pointer rounded-md border border-black">
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Action Button */}
            <button
                onClick={() => router.push("/checkout")}
                className="w-full py-5 bg-yellow-400 text-black text-sm font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-[0.98] transition-all duration-300 shadow-md rounded-md border border-yellow-500 cursor-pointer"
            >
                Proceed to Checkout
            </button>
        </div>
    );
};

export default CartSummary;
