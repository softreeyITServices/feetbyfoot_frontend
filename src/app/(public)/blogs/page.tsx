import Footer from "@/component/common/Footer";
import Navbar from "@/component/common/navbar";
import Image from "next/image";
import Link from "next/link";

type BlogCard = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const BLOGS: BlogCard[] = [
  {
    id: "mens-socks-daily-use",
    title: "How to Choose the Right Men's Socks for Daily Use? | Feetbyfoot",
    href: "/blogs/mens-socks-daily-use",
    imageSrc: "/assets/images/mens_socks_daily_use.png",
    imageAlt: "How to choose the right men's socks for daily use",
  },
  {
    id: "winter-socks-women",
    title:
      "Winter Socks for Women — The Ultimate Feetbyfoot Guide to Warm, Cozy Feet",
    href: "/blogs/winter-socks-women",
    imageSrc: "/assets/images/socks_for_women.png",
    imageAlt: "Winter socks for women guide",
  },
  {
    id: "guide-womens-socks-winter",
    title:
      "Your Complete Guide to Choosing the Best Socks for Women This Winter",
    href: "/blogs/guide-womens-socks-winter",
    imageSrc: "/assets/images/ultimate_guide.png",
    imageAlt: "Ultimate guide to socks for women",
  },
  {
    id: "best-socks-for-men",
    title: "Elevate Your Style with Feetbyfoot: The Ultimate Guide to the Best Socks for Men",
    href: "/blogs/best-socks-for-men",
    imageSrc: "/assets/images/the_best_socks.png",
    imageAlt: "The best socks for men",
  },
];

export default function BlogsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <div className="mx-auto max-w-[980px] px-4 py-10">
          {/* Header (matches screenshot style) */}
          <header className="text-center">
            <div className="mx-auto inline-flex items-center justify-center bg-[#F2C100] px-14 py-2">
              <h1 className="text-[16px] font-semibold text-neutral-900">Blogs</h1>
            </div>

            <p className="mt-2 text-[10px] text-neutral-500">
              {/* Keep exact text as per your design (replace if needed) */}
              Provider news to receive exclusive deals &amp; gifts
            </p>
          </header>

          {/* Grid (3 on first row, then next starts like screenshot) */}
          <section className="mt-8">
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-3">
              {BLOGS.map((b) => (
                <BlogTile key={b.id} blog={b} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>

  );
}

function BlogTile({ blog }: { blog: BlogCard }) {
  return (
    <article className="w-full">
      <Link href={blog.href} className="block">
        <div className="overflow-hidden bg-white">
          <Image
            src={blog.imageSrc}
            alt={blog.imageAlt}
            width={900}
            height={600}
            className="h-auto w-full object-cover"
            priority={blog.id === "mens-socks-daily-use"}
          />
        </div>

        <h2
          className="
    mt-4
    font-normal
    text-[20px]
    leading-[150%]
    tracking-normal
    text-neutral-900
    line-clamp-2
  "
        >
          {blog.title}
        </h2>


      </Link>
    </article>
  );
}