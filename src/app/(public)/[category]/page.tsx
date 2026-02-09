import FiltersSidebar from "@/component/ui/FiltersSidebar";
import ProductCard from "@/component/ui/ProductCard";
import Image from "next/image";
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Dropdown from "@/component/ui/Dropdown";

const CATEGORY_CONFIG = {
  mens: {
    label: 'Mens',
    title: 'Mens Socks',
    description: 'Shop premium mens socks at Feet By Foot',
  },
  womens: {
    label: 'Womens',
    title: 'Womens Socks',
    description: 'Shop premium womens socks at Feet By Foot',
  },
  kids: {
    label: 'Kids',
    title: 'Kids Socks',
    description: 'Shop premium kids socks at Feet By Foot',
  },
  gifts: {
    label: 'Gifts',
    title: 'Gift Socks',
    description: 'Perfect sock gifts for every occasion',
  },
} as const

type CategoryKey = keyof typeof CATEGORY_CONFIG


export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const key = category.toLowerCase() as CategoryKey
  const config = CATEGORY_CONFIG[key]

  if (!config) {
    notFound()
  }

  return {
    title: `${config.title} | Feet By Foot`,
    description: config.description,
  }
}

const products = [
  {
    imageSrc: "/assets/images/product-1.png",
    altText: "Grey Woolen Socks",
    categories: "Womens, Crew, Mens, Winter",
    title: "Grey & Black Checked Woolen Socks | Soft Fleece-Lined Warm Winter Socks",
    originalPrice: "299.00",
    discountedPrice: "209.00",
  },
  {
    imageSrc: "/assets/images/product-2.png",
    altText: "Reindeer Pattern Socks",
    categories: "Womens, Crew, Winter Socks",
    title: "Winter Reindeer Pattern Woolen Socks – Cozy Warm Thermal Socks",
    originalPrice: "299.00",
    discountedPrice: "199.00",
  },
  {
    imageSrc: "/assets/images/product-3.png",
    altText: "Navy Blue Crew Socks",
    categories: "Mens, Crew, Winter Socks",
    title: "Classic Navy Blue Woolen Crew Socks – Soft, Durable & Everyday Comfort",
    originalPrice: "299.00",
    discountedPrice: "199.00",
  },
];

const SORT_OPTIONS = [
  { label: 'Latest', value: 'latest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {

  const { category } = await params
  const key = category.toLowerCase() as CategoryKey
  const config = CATEGORY_CONFIG[key]


  if (!config) {
    notFound()
  }

  return (
    <main className="w-full">
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
            alt="Mens Category Banner"
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
          <div className="w-full">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 text-sm">
                <span>9 products</span>
              </div>

              {/* <select className="border px-3 py-2 text-sm w-50 pr-4">
                <option>Sort by latest</option>
              </select> */}
              <Dropdown
                label=""
                options={SORT_OPTIONS}
                // onChange={() => {}}
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <ProductCard
                  key={index}
                  imageSrc={product.imageSrc}
                  altText={product.altText}
                  categories={product.categories}
                  title={product.title}
                  originalPrice={product.originalPrice}
                  discountedPrice={product.discountedPrice}
                />
              ))}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
