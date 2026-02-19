"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { wishlistService } from "@/domain/application/services/wishlist.service";
import { WishlistProduct } from "@/domain/shared/types/wishlist.type";


const WishlistPage = () => {
  const router = useRouter();

  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();

      setProducts(response.products ?? []);
    } catch (error: unknown) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      toast.success("Removed from wishlist");

      // refresh list
      fetchWishlist();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            {/* Product Image */}
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/product/${product._id}`)}
            >
              <img
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name || "Product"}
                className="w-full h-48 object-cover rounded-md"
              />
            </div>

            {/* Product Info */}
            <div className="mt-4 space-y-2">
              <h3 className="font-medium truncate">
                {product.name || "Product Name"}
              </h3>

              {product.price && (
                <p className="text-gray-600">₹ {product.price}</p>
              )}

              <button
                onClick={() => handleRemove(product._id)}
                className="w-full mt-2 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
