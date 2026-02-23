"use client";

import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import { CartBasketIcon } from "@/icons/CartBasketIcon";
import { SustainableIcon } from "@/icons/SustainableIcon";
import { ComfortToeIcon } from "@/icons/ComfortToeIcon";
import { HassleFreeIcon } from "@/icons/HassleFreeIcon";
import { MoneyBackIcon } from "@/icons/MoneyBackIcon";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cart.slice";
import { useState } from "react";
import { openCart } from "@/store/slices/ui.slice";
import { RatingStarIcon } from "@/icons/RatingStarIcon";

interface ProductSummaryProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    description: string;
    baseImage: string;
    sizes: {
      _id?: string;
      size: string;
      quantity: number;
      isActive: boolean;
    }[];
  };
  totalRatings: number;
  averageRating: number;
}

export default function ProductSummary({
  product,
  totalRatings,
  averageRating,
}: ProductSummaryProps) {
  const dispatch = useAppDispatch();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.baseImage,
        size: selectedSize,
        quantity,
      })
    );

    dispatch(openCart());
  };

  const scrollToReviews = () => {
    window.location.hash = "reviews";
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${i < Math.round(averageRating)
                ? "text-yellow-400"
                : "text-gray-300"
                }`}
            >
              <RatingStarIcon key={i}
                fill={i < Math.round(averageRating) ? "#FACC15" : "#D1D5DB"} />
            </span>
          ))}
        </div>

        <span className="text-sm text-gray-600">
          {averageRating.toFixed(1)}
        </span>

        <button
          onClick={scrollToReviews}
          className="text-sm text-gray-500 underline hover:text-black"
        >
          ({totalRatings} review{totalRatings !== 1 && "s"})
        </button>
      </div>

      {/* Price */}
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

      <SizeSelector
        sizes={product.sizes}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
      />

      <div className="flex gap-4 mt-6 items-center">
        <QuantitySelector
          quantity={quantity}
          onChangeQuantity={setQuantity}
        />

        <button
          onClick={handleAddToCart}
          className="px-10 bg-black text-white py-3 hover:bg-gray-800 flex items-center gap-2"
        >
          <CartBasketIcon width={13} height={15} fill="#fff" />
          <span>ADD TO BASKET</span>
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