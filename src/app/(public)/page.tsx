
import BestSelling from "@/component/home/BestSelling";
import CategoryStrip from "@/component/home/CategoryStrip";
import CustomerShowcase from "@/component/home/CustomerShowcase";
import HelpCTA from "@/component/home/HelpCTA";
import HeroBanner from "@/component/home/HeroBanner";
import PromoSection from "@/component/home/PromoSection";
import ShopByCategory from "@/component/home/ShopByCategory";
import TrendingGallery from "@/component/home/TrendingGallery";
import PopularSearches from "@/component/home/PopularSearches";
import { Marquee } from "@/component/ui/Marquee";
import ProductCard from "@/component/ui/ProductCard";
import SortDropdown from "@/component/ui/SortDropdown";
import FiltersSidebar from "@/component/ui/FiltersSidebar";
import Link from "next/link";
import { productService } from "@/domain/application/services/product.service";
import { wishlistService } from "@/domain/application/services/wishlist.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/services/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: {
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
    sortBy?: string;
  };
}) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.search?.trim();

  if (searchQuery) {
    const page = Number(resolvedSearchParams?.page ?? 1);
    const perpage = 20;
    const sortBy = resolvedSearchParams?.sortBy ?? "default";

    const toArray = (val: string | string[] | undefined): string[] => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    };
    const mergeUnique = (first: string[], second: string[]) =>
      Array.from(new Set([...first, ...second]));

    const genderFilters = toArray(resolvedSearchParams?.gender);
    const categoryFilters = mergeUnique(
      toArray(resolvedSearchParams?.category),
      toArray(resolvedSearchParams?.categoryIds),
    );
    const subcategoryFilters = mergeUnique(
      toArray(resolvedSearchParams?.subcategory),
      toArray(resolvedSearchParams?.categoryTypeIds),
    );
    const sizeFilters = mergeUnique(
      toArray(resolvedSearchParams?.size),
      toArray(resolvedSearchParams?.sizes),
    );
    const colorFilters = mergeUnique(
      toArray(resolvedSearchParams?.color),
      toArray(resolvedSearchParams?.colors),
    );

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

    const rawResponse = await productService.getPublicProducts({
      page,
      limit: perpage,
      sortBy,
      search: searchQuery,
      gender: genderFilters.length > 0 ? genderFilters : undefined,
      categories: categoryFilters.length > 0 ? categoryFilters : undefined,
      subcategories:
        subcategoryFilters.length > 0 ? subcategoryFilters : undefined,
      sizes: sizeFilters.length > 0 ? sizeFilters : undefined,
      colors: colorFilters.length > 0 ? colorFilters : undefined,
    });

    const products = rawResponse?.products ?? [];
    const total = rawResponse?.total ?? 0;
    const totalPages = rawResponse?.totalPages ?? 1;

    const buildPageHref = (p: number) => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (p > 1) params.set("page", String(p));
      return `/?${params.toString()}`;
    };

    return (
      <main className="w-full min-h-[60vh] py-8">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header section with Clear search option */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                Search Results for &ldquo;<span className="text-yellow-600">{searchQuery}</span>&rdquo;
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Found {total} {total === 1 ? "product" : "products"}
              </p>
            </div>
            <Link
              href="/"
              scroll={false}
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
            >
              ✕ Clear Search & Show Home
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
            <aside className="hidden lg:block sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto">
              <FiltersSidebar />
            </aside>

            <div id="products-section">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-600">
                  Showing {total > 0 ? (page - 1) * perpage + 1 : 0}–
                  {Math.min(page * perpage, total)} of {total} products
                </span>
                <SortDropdown />
              </div>

              {products?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
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
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-xl">
                  <p className="text-lg font-medium text-gray-800">
                    No products matched your search.
                  </p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Try checking your spelling or searching for different keywords.
                  </p>
                  <Link
                    href="/"
                    scroll={false}
                    className="inline-block bg-black text-white px-6 py-2.5 text-sm font-medium rounded hover:bg-neutral-800 transition"
                  >
                    Return to Home
                  </Link>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages })?.map((_, i) => (
                    <Link
                      key={i}
                      href={buildPageHref(i + 1)}
                      scroll={false}
                      className={`px-4 py-2 border text-sm rounded ${
                        page === i + 1
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <HeroBanner />
      <Marquee />
      <CategoryStrip />
      <BestSelling />
      <PromoSection />
      <ShopByCategory />
      <HelpCTA />
      <CustomerShowcase />
      <TrendingGallery />
      <PopularSearches />
    </>
  );
}

