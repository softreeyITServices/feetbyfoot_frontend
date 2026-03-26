"use client";

import Footer from "@/component/common/Footer";
import Navbar from "@/component/common/navbar";
import { BlogService, type Blog } from "@/domain/application/services/admin/blog.service";
import { safeNextImageSrc } from "@/lib/safeImageSrc";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BlogCard = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const FALLBACK_IMAGE = "/assets/images/Frame 44.png";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadBlogs = async () => {
      try {
        setLoading(true);
        setHasError(false);
        const res = await BlogService.getPublicList({ page: 1, limit: 30 });
        if (!isMounted) return;
        setBlogs(res.items ?? []);
      } catch {
        if (!isMounted) return;
        setHasError(true);
        setBlogs([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo<BlogCard[]>(
    () =>
      blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        href: `/blogs/${blog.slug || blog._id}`,
        imageSrc: safeNextImageSrc(blog.coverImage?.url, FALLBACK_IMAGE),
        imageAlt: blog.title || "Blog cover image",
      })),
    [blogs]
  );

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <div className="mx-auto max-w-245 px-4 py-10">
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
              {loading ? (
                <p className="text-[12px] text-neutral-500">Loading blogs...</p>
              ) : hasError ? (
                <p className="text-[12px] text-neutral-500">
                  Unable to load blogs right now.
                </p>
              ) : cards.length === 0 ? (
                <p className="text-[12px] text-neutral-500">No blogs available.</p>
              ) : (
                cards.map((b) => <BlogTile key={b.id} blog={b} />)
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function BlogTile({ blog }: { blog: BlogCard }) {
  const [imageSrc, setImageSrc] = useState(
    blog.imageSrc?.trim() ? blog.imageSrc : FALLBACK_IMAGE
  );

  return (
    <article className="w-full">
      <Link href={blog.href} className="block">
        <div className="overflow-hidden bg-white">
          <Image
            src={imageSrc}
            alt={blog.imageAlt}
            width={900}
            height={600}
            className="h-auto w-full object-cover"
            priority={false}
            onError={() => setImageSrc(FALLBACK_IMAGE)}
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