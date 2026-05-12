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
import { RatingHalfStarIcon } from "@/icons/RatingHalfStarIcon";
import { DeliveryService } from "@/domain/application/services/delivery.service";


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
    new Set(product.sizes.map((s) => s.color).filter(Boolean)),
  ) as string[];

  // Filter sizes available for the selected color
  const sizesForColor = selectedColor
    ? product.sizes.filter((s) => s.color === selectedColor)
    : product.sizes;

  // Check if currently selected combination is out of stock
  const selectedVariant = product.sizes.find(
    (s) =>
      s.size === selectedSize && (!selectedColor || s.color === selectedColor),
  );
  const isOutOfStock =
    !!selectedVariant &&
    (selectedVariant.quantity <= 0 || !selectedVariant.isActive);
  const [loading, setLoading] = useState(false);
  
  // Pincode Check State
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<"SUCCESS" | "ERROR" | null>(null);
  const [serviceableCity, setServiceableCity] = useState<string | null>(null);

  const handlePincodeCheck = async (pincode: string) => {
    try {
      setCheckingPincode(true);
      setPincodeStatus(null);
      setServiceableCity(null);
      
      const res = await DeliveryService.checkServiceability(pincode);
      console.log("Delhivery API Result:", res);

      const hasCodes = res && res.delivery_codes && res.delivery_codes.length > 0;
      
      if (hasCodes) {
        const city = res.delivery_codes[0].postal_code.city || "your location";
        setServiceableCity(city);
        setPincodeStatus("SUCCESS");
      } else {
        setPincodeStatus("ERROR");
      }
    } catch (err) {
      console.error("Pincode check failed", err);
      setPincodeStatus("ERROR");
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleAddToCart = async () => {
    if (!session?.accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Friendly check for Admin role
    if ((session.user as any)?.role === "admin") {
      alert("Admins are restricted from making purchases. Please use a customer account to shop.");
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
        }),
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
          {Array.from({ length: 5 }).map((_, i) => {
            const isFull = i + 1 <= Math.floor(averageRating);
            const isHalf = !isFull && i < averageRating;

            return (
              <span key={i} className="text-lg">
                {isFull ? (
                  <RatingStarIcon fill="#FACC15" />
                ) : isHalf ? (
                  <RatingHalfStarIcon />
                ) : (
                  <RatingStarIcon fill="#D1D5DB" />
                )}
              </span>
            );
          })}
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
      <div className="flex items-center gap-3 mb-1">
        <span className="text-green-600 text-xl font-semibold">
          ₹{product.price}
        </span>
        <span className="line-through text-gray-400">₹{product.mrp}</span>
        {product.mrp > product.price && (
          <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-500 mb-4">(Inclusive of all taxes)</p>

      {/* Color Selector */}
      {hasColors && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">SELECT COLOR</p>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setSelectedSize(null);
                }}
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
        <p className="mt-2 text-sm font-semibold text-red-500">
          ⚠ Out of Stock
        </p>
      )}

      <div className="flex gap-4 mt-6 items-center">
        <QuantitySelector quantity={quantity} onChangeQuantity={setQuantity} />

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || loading}
          className={`px-10 py-3 flex items-center gap-2 transition ${
            isOutOfStock || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          <CartBasketIcon
            width={13}
            height={15}
            fill={isOutOfStock || loading ? "#9ca3af" : "#fff"}
          />
          <span>
            {loading
              ? "ADDING..."
              : isOutOfStock
                ? "OUT OF STOCK"
                : "ADD TO BASKET"}
          </span>
        </button>
      </div>

      {/* PINCODE CHECKER - WITH MANUAL BUTTON AND ERROR DETAIL */}
      <div className="my-8 p-5 border-2 border-dashed border-neutral-200 rounded-2xl bg-white shadow-sm max-w-sm">
        <p className="text-xs font-bold text-neutral-800 mb-3 uppercase tracking-widest">Delivery Check</p>
        <div className="flex gap-2">
          <input 
            id="pincode-input"
            type="text" 
            placeholder="Enter Pincode"
            maxLength={6}
            className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          />
          <button 
            onClick={() => {
              const el = document.getElementById('pincode-input') as HTMLInputElement;
              if (el && /^[0-9]{6}$/.test(el.value)) {
                handlePincodeCheck(el.value);
              } else {
                alert("Please enter a valid 6-digit pincode");
              }
            }}
            disabled={checkingPincode}
            className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800 disabled:opacity-50"
          >
            {checkingPincode ? "..." : "CHECK"}
          </button>
        </div>
        {checkingPincode && <p className="text-[10px] text-gray-400 mt-2 animate-pulse">Checking Delhivery servers...</p>}
        {pincodeStatus === "SUCCESS" && (
          <p className="text-xs text-green-600 mt-2 font-semibold flex items-center gap-1">
            ✅ Delivered to {serviceableCity}
          </p>
        )}
        {pincodeStatus === "ERROR" && (
          <div className="mt-2">
            <p className="text-xs text-red-500 font-semibold flex items-center gap-1">❌ Not serviceable here</p>
            <p className="text-[10px] text-gray-400 mt-1 italic">Note: If this is a valid pincode, please check your internet or try refreshing.</p>
          </div>
        )}
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
