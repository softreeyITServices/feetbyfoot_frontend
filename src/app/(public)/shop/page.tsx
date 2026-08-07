import FiltersSidebar from "@/component/ui/FiltersSidebar";
import ProductCard from "@/component/ui/ProductCard";
import Image from "next/image";
import type { Metadata } from "next";
import { productService } from "@/domain/application/services/product.service";
import Link from "next/link";
import SortDropdown from "@/component/ui/SortDropdown";
import { wishlistService } from "@/domain/application/services/wishlist.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/services/auth/[...nextauth]/route";
import { SectionBannerService } from "@/domain/application/services/admin/sectionBanner.service";

export const metadata: Metadata = {
  title: "Shop | Feet By Foot",
  description: "Shop all premium socks at Feet By Foot",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    gender?: string | string[];
    category?: string | string[];
    categoryIds?: string | string[];
    subcategory?: string | string[];
    categoryTypeIds?: string | string[];
    size?: string | string[];
    sizes?: string | string[];
    color?: string | string[];
    colors?: string | string[];
    length?: string | string[];
    discount?: string;
    minDiscount?: string;
    packType?: string | string[];
    sortBy?: string;
    isBestseller?: string;
    isNewArrival?: string;
    isGiftPack?: string;
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
  const mergeUnique = (first: string[], second: string[]) =>
    Array.from(new Set([...first, ...second]));

  const genderFilters = toArray(resolvedSearchParams.gender);
  const categoryFilters = mergeUnique(
    toArray(resolvedSearchParams.category),
    toArray(resolvedSearchParams.categoryIds),
  );
  const subcategoryFilters = mergeUnique(
    toArray(resolvedSearchParams.subcategory),
    toArray(resolvedSearchParams.categoryTypeIds),
  );
  const sizeFilters = mergeUnique(
    toArray(resolvedSearchParams.size),
    toArray(resolvedSearchParams.sizes),
  );
  const colorFilters = mergeUnique(
    toArray(resolvedSearchParams.color),
    toArray(resolvedSearchParams.colors),
  );

  const isBestseller = resolvedSearchParams.isBestseller === "true";
  const isNewArrival = resolvedSearchParams.isNewArrival === "true";
  const isGiftPack = resolvedSearchParams.isGiftPack === "true";
  const packTypeFilters = toArray(resolvedSearchParams.packType)?.map(
    (v) => v === "true",
  );
  const effectivePackTypes =
    packTypeFilters.length > 0 ? packTypeFilters : isGiftPack ? [true] : [];

  const session = await getServerSession(authOptions);
  const token = session?.accessToken ?? null;

  let wishlistIds = new Set<string>();
  if (token) {
    try {
      const response = await wishlistService.getWishlist(token);
      const wishlistProducts = response?.data?.products ?? [];
      wishlistIds = new Set(wishlistProducts?.map((item) => item._id));
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

  let rawResponse:
    | Awaited<ReturnType<typeof productService.getPublicProducts>>
    | undefined;

  try {
    rawResponse = await productService.getPublicProducts({
      gender: genderFilters,
      page,
      limit: perpage,
      search: resolvedSearchParams.search?.trim(),
      sortBy,
      categories: categoryFilters,
      subcategories: subcategoryFilters,
      sizes: sizeFilters,
      colors: colorFilters,
      minDiscount: resolvedSearchParams.minDiscount
        ? Number(resolvedSearchParams.minDiscount)
        : resolvedSearchParams.discount
          ? Number(resolvedSearchParams.discount)
          : undefined,
      packTypes: effectivePackTypes,
      isBestseller,
      isNewArrival,
    });
    console.log("rawResponse", rawResponse);
    console.log("[ShopPage] rawResponse keys:", Object.keys(rawResponse ?? {}));
    console.log(
      "[ShopPage] products type:",
      typeof rawResponse?.products,
      "isArray:",
      Array.isArray(rawResponse?.products),
      "value:",
      rawResponse?.products,
    );
    console.log(
      "[ShopPage] total:",
      rawResponse?.total,
      "totalPages:",
      rawResponse?.totalPages,
    );
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : err);
    throw err;
  }

  const { products, total, totalPages } = rawResponse!;


  if (products !== undefined && !Array.isArray(products)) {
    console.error(
      "[ShopPage] products is NOT an array! Type:",
      typeof products,
      "Value:",
      products,
    );
  }

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

  let outletBannerUrl: string | null = null;
  try {
    const banners = await SectionBannerService.getBySectionKey("OUTLET");
    outletBannerUrl = banners.find((banner) => banner.isActive)?.image ?? null;
  } catch {
    outletBannerUrl = null;
  }

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

      <section className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-6">
        <div className="overflow-hidden rounded-xl">
          <Image
            src={outletBannerUrl ?? "/assets/images/mens-category-banner.png"}
            alt="Shop Banner"
            width={1200}
            height={300}
            className="w-full h-auto object-cover"
            unoptimized={Boolean(outletBannerUrl)}
          />
        </div>
      </section>

      <section className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          <aside className="hidden lg:block sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto">
            <FiltersSidebar />
          </aside>

          <div id="products-section">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm">
                Showing {(page - 1) * perpage + 1}–
                {Math.min(page * perpage, total)} of {total} products
              </span>
              <SortDropdown />
            </div>

            {products?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products?.map((product, idx) => {
                  console.log(
                    `[ShopPage] product[${idx}] _id:`,
                    product._id,
                    "sizes:",
                    product.sizes,
                    "tags:",
                    product.tags,
                    "imageUrls:",
                    product.imageUrls,
                    "price:",
                    product.price,
                    "salePrice:",
                    product.salePrice,
                  );
                  return (
                    <ProductCard
                      wishlist={true}
                      wishlistSelect={wishlistIds.has(product._id)}
                      home={false}
                      key={product._id}
                      id={product._id}
                      size={product.sizes}
                      imageSrc={product.imageUrls?.[0]}
                      hoverImageSrc={product.imageUrls?.[1]}
                      altText={product.name}
                      categories={
                        (product.tags ?? []).length > 0
                          ? product.tags.join(", ")
                          : product.brand || "Socks"
                      }
                      title={product.name}
                      originalPrice={product.price?.toFixed(2)}
                      discountedPrice={product.salePrice?.toFixed(2)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="align-middle justify-center flex py-10">
                No Products found with the combination of filters
              </div>
            )}

            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages })?.map((_, i) => (
                <Link
                  key={i}
                  href={buildPageHref(i + 1)}
                  scroll={false}
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
