"use client";

import ProductTabs from "./ProductTabs";
import { Review } from "@/domain/shared/types/rating.type";
import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import { CartBasketIcon } from "@/icons/CartBasketIcon";
import { SustainableIcon } from "@/icons/SustainableIcon";
import { ComfortToeIcon } from "@/icons/ComfortToeIcon";
import { HassleFreeIcon } from "@/icons/HassleFreeIcon";
import { MoneyBackIcon } from "@/icons/MoneyBackIcon";
import { useAppDispatch } from "@/store/hooks";
import { addToCartAsync } from "@/store/slices/cart.slice";
import { useState } from "react";
import { openCart } from "@/store/slices/ui.slice";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
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
      color?: string;
      quantity: number;
      isActive: boolean;
    }[];
  };
  totalRatings: number;
  averageRating: number;
  reviews: Review[];
}

export default function ProductSummary({
  product,
  totalRatings,
  averageRating,
  reviews,
}: ProductSummaryProps) {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Derive unique colors from all variants
  const uniqueColors = Array.from(
    new Set(product.sizes.map((s) => s.color).filter(Boolean))
  ) as string[];

  // Filter sizes available for the selected color
  const sizesForColor = selectedColor
    ? product.sizes.filter((s) => s.color === selectedColor)
    : product.sizes;

  // Check if currently selected combination is out of stock
  const selectedVariant = product.sizes.find(
    (s) => s.size === selectedSize && (!selectedColor || s.color === selectedColor)
  );
  const isOutOfStock = !!selectedVariant && (selectedVariant.quantity <= 0 || !selectedVariant.isActive);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!session?.accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (hasColors && !selectedColor) {
      alert("Please select a color");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    if (isOutOfStock) {
      alert("This size/color combination is out of stock");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        addToCartAsync({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.baseImage,
          size: selectedSize,
          color: selectedColor ?? undefined,
          quantity,
        })
      ).unwrap();

      dispatch(openCart());
    } catch (error: any) {
      alert(error.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const hasColors = uniqueColors.length > 0;

  const scrollToReviews = () => {
    const reviewsTab = document.getElementById("product-tabs");
    if (reviewsTab) {
      reviewsTab.scrollIntoView({ behavior: "smooth" });
    }
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

      {/* Color Selector */}
      {hasColors && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">SELECT COLOR</p>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((color) => (
              <button
                key={color}
                onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                title={color}
                className={`w-8 h-8 rounded-full border-2  transition ${
                  selectedColor === color
                    ? "border-black scale-110"
                    : "border-gray-400 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color.toLowerCase() }}
              />
            ))}
          </div>
          {selectedColor && (
            <p className="text-xs text-gray-500 mt-1">{selectedColor}</p>
          )}
        </div>
      )}

      <SizeSelector
        sizes={sizesForColor}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
      />

      {/* Out of Stock indicator */}
      {isOutOfStock && (
        <p className="mt-2 text-sm font-semibold text-red-500">⚠ Out of Stock</p>
      )}

      <div className="flex gap-4 mt-6 items-center">
        <QuantitySelector
          quantity={quantity}
          onChangeQuantity={setQuantity}
        />

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || loading}
          className={`px-10 py-3 flex items-center gap-2 transition ${
            isOutOfStock || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          <CartBasketIcon width={13} height={15} fill={isOutOfStock || loading ? "#9ca3af" : "#fff"} />
          <span>{loading ? "ADDING..." : isOutOfStock ? "OUT OF STOCK" : "ADD TO BASKET"}</span>
        </button>
      </div>

      <div id="product-tabs" className="mt-10">
        <ProductTabs
          description={product.description}
          reviews={reviews}
          totalRatings={totalRatings}
          averageRating={averageRating}
        />
      </div>

      {/* <div className="flex gap-8 mt-10">
        <SustainableIcon width={82} height={93} />
        <ComfortToeIcon width={96} height={93} />
        <HassleFreeIcon width={96} height={93} />
        <MoneyBackIcon width={96} height={93} />
      </div> */}
    </div>
  );
}