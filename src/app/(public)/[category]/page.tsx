import FiltersSidebar from "@/component/ui/FiltersSidebar";
import ProductCard from "@/component/ui/ProductCard";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Dropdown from "@/component/ui/Dropdown";
import { productService } from "@/domain/application/services/product.service";
import Link from "next/link";

const CATEGORY_CONFIG = {
  mens: {
    label: "Mens",
    title: "Mens Socks",
    description: "Shop premium mens socks at Feet By Foot",
    gender: "MENS",
  },
  womens: {
    label: "Womens",
    title: "Womens Socks",
    description: "Shop premium womens socks at Feet By Foot",
    gender: "WOMENS",
  },
  kids: {
    label: "Kids",
    title: "Kids Socks",
    description: "Shop premium kids socks at Feet By Foot",
  },
  gifts: {
    label: "Gifts",
    title: "Gift Socks",
    description: "Perfect sock gifts for every occasion",
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const { category } = await params
  const key = category.toLowerCase() as CategoryKey
  const config = CATEGORY_CONFIG[key];

  if (!config) notFound();

  return {
    title: `${config.title} | Feet By Foot`,
    description: config.description,
  };
}

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { page?: string };
}) {
  const { category } = await params
  const key = category.toLowerCase() as CategoryKey
  const config = CATEGORY_CONFIG[key];

  if (!config) notFound();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const perpage = 20;

  const {
    products,
    total,
    totalPages,
  } = await productService.getPublicProducts({
    gender: category.toUpperCase(),
    page,
    limit: perpage,
  });

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

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="overflow-hidden rounded-xl">
          <Image
            src="/assets/images/mens-category-banner.png"
            alt={`${config.label} Category Banner`}
            width={1200}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Filters */}
          <aside className="hidden lg:block">
            <FiltersSidebar />
          </aside>

          {/* Products */}
          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm">
                Showing {(page - 1) * perpage + 1}–
                {Math.min(page * perpage, total)} of {total} products
              </span>

              <Dropdown label="" options={SORT_OPTIONS} />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
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

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`?page=${i + 1}`}
                  className={`px-4 py-2 border text-sm ${page === i + 1
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
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
