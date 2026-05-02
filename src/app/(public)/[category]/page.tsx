import FiltersSidebar from "@/component/ui/FiltersSidebar";
import ProductCard from "@/component/ui/ProductCard";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productService } from "@/domain/application/services/product.service";
import Link from "next/link";
import SortDropdown from "@/component/ui/SortDropdown";
import { wishlistService } from "@/domain/application/services/wishlist.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/services/auth/[...nextauth]/route";
import { SectionBannerService } from "@/domain/application/services/admin/sectionBanner.service";


const CATEGORY_CONFIG = {
  mens: {
    label: "Mens",
    title: "Mens Socks",
    description: "Shop premium mens socks at Feet By Foot",
    gender: "MENS",
    sectionBannerKey: "MENS",
  },
  womens: {
    label: "Womens",
    title: "Womens Socks",
    description: "Shop premium womens socks at Feet By Foot",
    gender: "WOMENS",
    sectionBannerKey: "WOMENS",
  },
  kids: {
    label: "Kids",
    title: "Kids Socks",
    description: "Shop premium kids socks at Feet By Foot",
    gender: "KIDS",
    sectionBannerKey: "KIDS",
  },
  gifts: {
    label: "Gifts",
    title: "Gift Socks",
    description: "Perfect sock gifts for every occasion",
    sectionBannerKey: "GIFTS",
    isGiftPack: true,
  },
  outlet: {
    label: "Outlet",
    title: "Outlet Socks",
    description: "Shop premium socks at Feet By Foot",
    sectionBannerKey: "OUTLET",
  },
  brand: {
    label: "Brand",
    title: "Brand",
    description: "Explore Feet By Foot products by brand",
  },
} as const;

function CategoryBannerPicture({
  src,
  alt,
  unoptimized = false,
}: {
  src: string;
  alt: string;
  unoptimized?: boolean;
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl shadow-md">
      <Image
        src={src}
        alt={alt}
        width={1400}
        height={350}
        className="w-full h-auto block"
        sizes="(max-width: 1280px) 100vw, 1400px"
        unoptimized={unoptimized}
        priority
      />
    </div>
  );
}

type CategoryKey = keyof typeof CATEGORY_CONFIG;

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const { category } = await params;
  const key = category.toLowerCase() as CategoryKey;
  const config = CATEGORY_CONFIG[key];

  if (!config) notFound();

  return {
    title: `${config.title} | Feet By Foot`,
    description: config.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
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
  const { category } = await params;
  const key = category.toLowerCase() as CategoryKey;
  const config = CATEGORY_CONFIG[key];

  if (!config) notFound();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const perpage = 20;
  const sortBy = resolvedSearchParams.sortBy ?? "default";
  const defaultGender = "gender" in config ? config.gender : undefined;

  // Helper: always return string[] from a searchParam value
  const toArray = (val: string | string[] | undefined): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const session = await getServerSession(authOptions);
  const token = session?.accessToken ?? null;

  // FIX 1: type as Set<string> and initialise as empty Set (not empty string)
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

      // Wishlist can be unavailable (e.g. admin role) or not created yet (404).
      // In those cases render page with empty wishlist instead of throwing.
      if (status !== 401 && status !== 403 && status !== 404) {
        throw error;
      }
    }
  }

  const { products, total, totalPages } = await productService.getPublicProducts({
    // If the URL doesn't explicitly include gender, default to the route's config.gender.
    // This prevents /mens, /womens, /kids from all showing the same unfiltered product list.
 

    gender:
      resolvedSearchParams.gender !== undefined
        ? toArray(resolvedSearchParams.gender)
        : defaultGender
          ? [defaultGender]
          : [],
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
    packTypes:
      resolvedSearchParams.packType !== undefined
        ? toArray(resolvedSearchParams.packType).map((v) => v === "true")
        : "isGiftPack" in config && config.isGiftPack
          ? [true]
          : [],
  });



  // FIX 2: build a base query string that preserves all current filters
  const buildPageHref = (pageNum: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(resolvedSearchParams)) {
      if (k === "page") continue;
      if (Array.isArray(v)) v.forEach((val) => qs.append(k, val));
      else if (v !== undefined) qs.set(k, v);
    }

    // Preserve the default gender filter in pagination links,
    // so clicking "page 2" doesn't drop the /mens:/womens:/kids filter.
    if (resolvedSearchParams.gender === undefined && defaultGender) {
      qs.set("gender", defaultGender);
    }
    if (
      resolvedSearchParams.packType === undefined &&
      "isGiftPack" in config &&
      config.isGiftPack
    ) {
      qs.set("packType", "true");
    }
    qs.set("page", String(pageNum));
    return `?${qs.toString()}`;
  };

  const FALLBACK_BANNER_SRC = "/assets/images/mens-category-banner.png";

  let sectionBanners: { _id: string; image: string; isActive: boolean }[] = [];
  if ("sectionBannerKey" in config) {
    try {
      const list = await SectionBannerService.getBySectionKey(
        config.sectionBannerKey
      );
      sectionBanners = list.filter((b) => b.isActive);
    } catch {
      sectionBanners = [];
    }
  }



  return (
    <main className="w-full">
      {/* Heading */}
      <div className="text-center mt-10">
        <h2 className="inline-block bg-yellow-400 px-40 py-2 text-4xl font-bold">
          {config.label}
        </h2>
        <p className="mt-2 text-gray-600 text-sm">
          Preorder now to receive exclusive deals & gifts
        </p>
      </div>

      {/* Banner: section banners from admin when present, else static fallback */}
      <section className="max-w-7xl mx-auto px-4 mt-6 mb-2">
        {sectionBanners.length > 0 ? (
          <div className="flex flex-col gap-4">
            {sectionBanners.map((b) => (
              <CategoryBannerPicture
                key={b._id}
                src={b.image}
                alt={`${config.label} category banner`}
                unoptimized
              />
            ))}
          </div>
        ) : (
          <CategoryBannerPicture
            src={FALLBACK_BANNER_SRC}
            alt={`${config.label} Category Banner`}
          />
        )}
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Filters */}
          <aside className="hidden lg:block sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto">
            <FiltersSidebar />
          </aside>

          {/* Products */}
          <div id="products-section">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm">
                Showing {(page - 1) * perpage + 1}–
                {Math.min(page * perpage, total)} of {total} products
              </span>
              <SortDropdown />
            </div>

            {/* Product Grid */}
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

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
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
