"use client";

import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import { CartBasketIcon } from "@/icons/CartBasketIcon";
import { SustainableIcon } from "@/icons/SustainableIcon";
import { ComfortToeIcon } from "@/icons/ComfortToeIcon";
import { HassleFreeIcon } from "@/icons/HassleFreeIcon";
import { MoneyBackIcon } from "@/icons/MoneyBackIcon";

interface ProductSummaryProps {
  product: {
    name: string;
    price: number;
    mrp: number;
    description: string;
    sizes: string[];
  };
}

export default function ProductSummary({ product }: ProductSummaryProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">
        {product.name}
      </h1>

      <div className="flex gap-3 mb-4">
        <span className="text-green-600 text-xl font-semibold">
          ₹{product.price}
        </span>
        <span className="line-through text-gray-400">
          ₹{product.mrp}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        {product.description}
      </p>

      <SizeSelector sizes={product.sizes} />

      <div className="flex gap-4 mt-6">
        <QuantitySelector />
        <button className="mt-4 px-10 bg-black text-white py-3 hover:bg-gray-800 flex items-center justify-evenly gap-2">
          <CartBasketIcon width={13} height={15} fill='#fff' /> <span> ADD TO BASKET</span>
        </button>
      </div>

      <div className="flex gap-8 mt-10">
        <SustainableIcon width={82} height={93} />
        <ComfortToeIcon width={96} height={93} />
        <HassleFreeIcon width={96} height={93} />
        <MoneyBackIcon width={96} height={93} />
      </div>
    </div>
  );
}
