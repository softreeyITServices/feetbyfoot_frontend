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
    <div className="rounded-xl bg-white border border-gray-200 p-3 relative">

      {/* Wishlist Icon */}
      {wishlist &&
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:scale-110 transition"
        >
          <Heart
            size={18}
            className={`transition ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
          />
        </button>
      }

      <Link
        href={productHref}
        className="relative block aspect-4/5 w-full shrink-0 overflow-hidden rounded-lg bg-gray-50 outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        title={title}
      >
        {!imgError && imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={altText}
            onError={() => setImgError(true)}
            className="object-cover object-center w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center px-2">
            {altText}
          </div>
        )}
      </Link>

      <div className="p-0 pt-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {categories}
        </p>

        <Link
          href={productHref}
          className="no-underline hover:underline text-black"
          title={title}
        >
          <h3 className="font-semibold text-sm mt-2 truncate">{title}</h3>
        </Link>

        <div className="mt-3">
          <span className="line-through text-gray-400 text-sm">
            ₹{originalPrice}
          </span>
          <span className="text-green-600 font-bold text-lg ml-2">
            ₹{discountedPrice}
          </span>
        </div>

        {colors.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">SELECT COLOR</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => handleColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
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

        <div className="mt-3">
          <SizeSelector
            sizes={filteredSizes}
            selectedSize={selectedSize}
            onSelectSize={handleSize}
          />
        </div>

        <span className="text-red-500 text-sm">{error}</span>

        <button
          className="mt-4 w-full bg-black text-white py-2 hover:bg-gray-800 flex items-center justify-evenly gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleCart}
          disabled={loading}
        >
          <CartBasketIcon width={13} height={15} fill="#fff" />
          <span>{loading ? "ADDING..." : "ADD TO BASKET"}</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
