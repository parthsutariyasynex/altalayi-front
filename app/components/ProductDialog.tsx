"use client";

import type { Product } from "../../modules/types/product";
import { X } from "lucide-react";

interface ProductDialogProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDialog({ product, onClose }: ProductDialogProps) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="w-[520px] bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔶 Yellow Header */}
        <div className="bg-[#f4b400] px-6 py-4 flex items-center justify-center relative">
          <h2 className="text-lg font-semibold text-black text-center">
            {product.pattern} - {product.tyre_size}
          </h2>

          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 
                       w-8 h-8 bg-white rounded-full 
                       flex items-center justify-center 
                       shadow hover:bg-gray-200 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 🔘 Grey Body Section */}
        <div className="bg-[#e5e5e5] px-6 py-2 text-sm">

          {[
            { label: "Item Code", value: product.item_code },
            { label: "Name", value: product.name ? product.name.split(' ')[0] : "N/A" },
            { label: "Size", value: product.tyre_size },
            { label: "Pattern", value: product.pattern },
            { label: "Year", value: product.year },
            { label: "Origin", value: product.origin },
            { label: "Stock", value: product.stock_qty },
          ].map((row, index) => (
            <div
              key={index}
              className="flex justify-between py-3 border-b border-gray-300 last:border-b-0"
            >
              <span className="text-gray-700">
                {row.label}
              </span>
              <span className="font-semibold text-gray-900">
                {row.value || "N/A"}
              </span>
            </div>
          ))}

          {/* Price Row */}
          <div className="flex justify-between py-4">
            <span className="text-gray-700 font-medium">Price</span>
            <span className="text-lg font-bold text-green-600">
              ﷼ {new Intl.NumberFormat("en-SA", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(product.final_price)}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}