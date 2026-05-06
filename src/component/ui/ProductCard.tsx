"use client";

import { CartBasketIcon } from "@/icons/CartBasketIcon";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { addToCartAsync } from "@/store/slices/cart.slice";
import { toSlug } from "@/lib/slugConverter";
import { openCart } from "@/store/slices/ui.slice";
import SizeSelector from "@/app/(public)/[category]/[product-slug]/[id]/components/SizeSelector";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { wishlistService } from "@/domain/application/services/wishlist.service";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

const COLOR_CSS_MAP: Record<string, string> = {
  Mint: "#98FF98",
  Peach: "#FFDAB9",
  Charcoal: "#36454F",
  Bronze: "#CD7F32",
  Mustard: "#FFDB58",
  Cream: "#FFFDD0",
};

function colorToCss(name: string): string {
  return COLOR_CSS_MAP[name] ?? name.toLowerCase();
}

function ProductCard({
  id,
  imageSrc,
  altText,
  categories,
  title,
  originalPrice,
  discountedPrice,
  size,
  home,
  wishlist,
  wishlistSelect,
  onWishlistChange
}: {
  home?: boolean;
  wishlist?: boolean;
  id: string;
  imageSrc: string;
  size: {
    _id?: string;
    size: string;
    quantity: number;
    isActive: boolean;
    color?: string;
  }[];
  altText: string;
  categories: string;
  title: string;
  originalPrice: string;
  discountedPrice: string;
  wishlistSelect?: boolean;
  onWishlistChange?: (id: string, removed: boolean) => void;
}) {
  const colors = [...new Set(size.map((s) => s.color).filter(Boolean))] as string[];

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(wishlistSelect ?? false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const filteredSizes = selectedColor
    ? size.filter((s) => s.color === selectedColor)
    : size;

  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleColor = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setError("");
  };

  const handleSize = (e: string) => {
    setSelectedSize(e);
    setError("");
  };

  const [loading, setLoading] = useState(false);

  const handleCart = async () => {
    if (!session?.accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if ((session.user as any)?.role === "admin") {
      setError("Admins are restricted from making purchases.");
      return;
    }

    if (!selectedSize) {
      setError("Size not selected");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        addToCartAsync({
          id,
          name: title,
          price: discountedPrice,
          image: imageSrc,
          size: selectedSize,
          color: selectedColor ?? undefined,
          quantity: 1,
        })
      ).unwrap();

      setSelectedSize(null);
      dispatch(openCart());
    } catch (err: any) {
      setError(err.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- WISHLIST TOGGLE ---------------- */
  const handleWishlist = async () => {
    if (!session?.accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        await wishlistService.removeFromWishlist(id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
        onWishlistChange?.(id, true);
      } else {
        await wishlistService.addToWishlist({ productId: id });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
        onWishlistChange?.(id, false);
      }
    } catch {
      toast.error("Wishlist action failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    setIsWishlisted(wishlistSelect ?? false);
  }, [wishlistSelect]);

  const categorySlug = toSlug(categories) || "products";
  const productHref = `/${categorySlug}/${toSlug(title)}/${id}`;

  return (
    <div className="rounded-lg sm:rounded-xl bg-white border border-gray-200 p-2 sm:p-3 relative h-full flex flex-col">
      {/* Wishlist Icon */}
      {wishlist &&
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-10 bg-white/90 p-1.5 sm:p-2 rounded-full shadow-md hover:scale-110 transition"
        >
          <Heart
            size={16}
            className={`sm:w-[18px] sm:h-[18px] transition ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        </button>
      }

      <Link
        href={productHref}
        className="relative block aspect-[3/4] sm:aspect-[4/5] w-full shrink-0 overflow-hidden rounded-md sm:rounded-lg bg-gray-50 outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        title={title}
      >
        {!imgError && imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={altText}
            onError={() => setImgError(true)}
            className="object-cover object-center w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-[10px] sm:text-xs text-center px-2">
            {altText}
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-0 pt-3 sm:pt-4 md:pt-5">
        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide line-clamp-1">
          {categories}
        </p>

        <Link
          href={productHref}
          className="no-underline hover:underline text-black"
          title={title}
        >
          <h3 className="font-semibold text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
            {title}
          </h3>
        </Link>

        <div className="mt-2 sm:mt-3 flex items-center gap-2 flex-wrap">
          <span className="line-through text-gray-400 text-xs sm:text-sm">
            ₹{originalPrice}
          </span>
          <span className="text-green-600 font-bold text-sm sm:text-lg">
            ₹{discountedPrice}
          </span>
        </div>

        {colors.length > 0 && (
          <div className="mt-2 sm:mt-3">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium mb-1.5 sm:mb-2">
              SELECT COLOR
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => handleColor(color)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? "border-black scale-110"
                      : "border-transparent hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: colorToCss(color) }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 sm:mt-3">
          <SizeSelector
            sizes={filteredSizes}
            selectedSize={selectedSize}
            onSelectSize={handleSize}
          />
        </div>

        <span className="text-red-500 text-[10px] sm:text-xs md:text-sm mt-1">{error}</span>

        <div className="mt-auto pt-2 sm:pt-3">
          <button
            className="w-full bg-black text-white py-1.5 sm:py-2 rounded-md hover:bg-gray-800 flex items-center justify-center gap-1.5 sm:gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-[11px] sm:text-xs md:text-sm transition-colors"
            onClick={handleCart}
            disabled={loading}
          >
            <CartBasketIcon 
              width={12} 
              height={14} 
              className="sm:w-[13px] sm:h-[15px]" 
              fill="#fff" 
            />
            <span>{loading ? "ADDING..." : "ADD TO BASKET"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;