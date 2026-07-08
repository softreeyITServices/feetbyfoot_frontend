"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { wishlistService } from "@/domain/application/services/wishlist.service";
import { WishlistApiProduct } from "@/domain/shared/types/wishlist.type";
import ProductCard from "@/component/ui/ProductCard";
import { isGetRequestError } from "@/lib/httpClientError";

const WishlistPageClient = () => {
  const router = useRouter();

  const [products, setProducts] = useState<WishlistApiProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      setProducts(response.data.products ?? []);
    } catch (error) {
      if (!isGetRequestError(error)) {
        toast.error("Failed to load wishlist");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWishlistChange = (productId: string, removed: boolean) => {
    if (removed) {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading wishlist...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            wishlist={true}
            wishlistSelect={true}
            home={false}
            key={product._id}
            id={product._id}
            size={product.sizes}
            imageSrc={product.imageUrls[0]}
            hoverImageSrc={product.imageUrls?.[1]}
            altText={product.name}
            categories={product.tags.join(", ")}
            title={product.name}
            originalPrice={product.price.toFixed(2)}
            discountedPrice={product.salePrice.toFixed(2)}
            onWishlistChange={handleWishlistChange}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPageClient;
