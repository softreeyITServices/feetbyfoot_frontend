import FiltersSidebar from "@/component/ui/FiltersSidebar";
import ProductCard from "@/component/ui/ProductCard";
import Image from "next/image";
import type { Metadata } from "next";
import { productService } from "@/domain/application/services/product.service";
import Link from "next/link";
import SortDropdown from "@/component/ui/SortDropdown";
import { wishlistService } from "@/domain/application/services/wishlist.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Shop | Feet By Foot",
  description: "Shop all premium socks at Feet By Foot",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    gender?: string | string[];
    category?: string | string[];
    subcategory?: string | string[];
    size?: string | string[];
    color?: string | string[];
    length?: string | string[];
    discount?: string;
    packType?: string | string[];
    sortBy?: string;
  };
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const perpage = 20;
  const sortBy = resolvedSearchParams.sortBy ?? "default";

  const toArray = (val: string | string[] | undefined): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const session = await getServerSession(authOptions);
  const token = session?.accessToken ?? null;

  let wishlistIds = new Set<string>();
  if (token) {
    try {
      const response = await wishlistService.getWishlist(token);
      const wishlistProducts = response?.data?.products ?? [];
      wishlistIds = new Set(wishlistProducts.map((item) => item._id));
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined;

      if (status !== 401 && status !== 403 && status !== 404) {
        throw error;
      }
    }
  }

  const { products, total, totalPages } = await productService.getPublicProducts({
    gender: toArray(resolvedSearchParams.gender),
    page,
    limit: perpage,
    sortBy,
    categories: toArray(resolvedSearchParams.category),
    subcategories: toArray(resolvedSearchParams.subcategory),
    sizes: toArray(resolvedSearchParams.size),
    colors: toArray(resolvedSearchParams.color),
    minDiscount: resolvedSearchParams.discount
      ? Number(resolvedSearchParams.discount)
      : undefined,
    packTypes: toArray(resolvedSearchParams.packType).map((v) => v === "true"),
  });

  const buildPageHref = (pageNum: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(resolvedSearchParams)) {
      if (k === "page") continue;
      if (Array.isArray(v)) v.forEach((val) => qs.append(k, val));
      else if (v !== undefined) qs.set(k, v);
    }
    qs.set("page", String(pageNum));
    return `?${qs.toString()}`;
  };

  return (
    <main className="w-full">
      <div className="text-center mt-10">
        <h2 className="inline-block bg-yellow-400 px-40 py-2 text-4xl font-bold">
          Shop
        </h2>
        <p className="mt-2 text-gray-600 text-sm">
          Explore all products in one place
        </p>
      </div>

      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="overflow-hidden rounded-xl">
          <Image
            src="/assets/images/mens-category-banner.png"
            alt="Shop Banner"
            width={1200}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block sticky top-32 h-fit">
            <FiltersSidebar />
          </aside>

          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm">
                Showing {(page - 1) * perpage + 1}–
                {Math.min(page * perpage, total)} of {total} products
              </span>
              <SortDropdown />
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard
                    wishlist={true}
                    wishlistSelect={wishlistIds.has(product._id)}
                    home={false}
                    key={product._id}
                    id={product._id}
                    size={product.sizes}
                    imageSrc={product.imageUrls[0]}
                    altText={product.name}
                    categories={product.tags.join(", ")}
                    title={product.name}
                    originalPrice={product.price.toFixed(2)}
                    discountedPrice={product.salePrice.toFixed(2)}
                  />
                ))}
              </div>
            ) : (
              <div className="align-middle justify-center flex py-10">
                No Products found with the combination of filters
              </div>
            )}

            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={buildPageHref(i + 1)}
                  className={`px-4 py-2 border text-sm ${
                    page === i + 1 ? "bg-black text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
