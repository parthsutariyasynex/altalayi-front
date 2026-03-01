"use client";

import type { Product } from  "../../modules/types/product";

interface ProductDialogProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDialog({ product, onClose }: ProductDialogProps) {

  if (!product) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);

  return (

    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >

      <div
        className="bg-white w-[450px] rounded-lg shadow-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl font-bold text-gray-400 hover:text-red-500"
        >
          ✕
        </button>

        {/* ✅ Magento fields */}
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          {product.pattern} - {product.tyre_size}
        </h2>

        {/* <img
          src={product.image_url}
          className="w-32 h-32 object-cover border rounded mb-4 mx-auto"
        /> */}

        <div className="space-y-2 text-sm">

          <p>
            <span className="font-semibold">Name:</span> {product.name}
          </p>

          <p>
            <span className="font-semibold">Size:</span> {product.tyre_size}
          </p>

          <p>
            <span className="font-semibold">Pattern:</span> {product.pattern}
          </p>

          <p>
            <span className="font-semibold">Year:</span> {product.year}
          </p>

          <p>
            <span className="font-semibold">Origin:</span> {product.origin}
          </p>

          <p>
            <span className="font-semibold">Stock:</span> {product.stock_qty}
          </p>

          <p className="text-lg font-bold text-green-600">
            {formatPrice(product.final_price)}
          </p>

        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          Close
        </button>

      </div>

    </div>

  );
}