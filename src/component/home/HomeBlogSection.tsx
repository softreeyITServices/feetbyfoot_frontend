"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogService, type Blog } from "@/domain/application/services/admin/blog.service";
import { safeNextImageSrc } from "@/lib/safeImageSrc";
import FadeIn from "../ui/FadeIn";

const FALLBACK_IMAGE = "/assets/images/Frame 44.png";

export default function HomeBlogSection() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlog = async () => {
      try {
        const res = await BlogService.getPublicList({ page: 1, limit: 1 });
        if (res.items && res.items.length > 0) {
          setBlog(res.items[0]);
        }
      } catch (error) {
        console.error("Error fetching latest blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBlog();
  }, []);

  if (loading || !blog) {
    return null;
  }

  const imageSrc = safeNextImageSrc(blog.coverImage?.url, FALLBACK_IMAGE);
  const href = `/blogs/${blog._id}`;

  return (
    <div className="mt-12 sm:mt-16 md:mt-20 flex flex-col items-center">
      <FadeIn direction="up" delay={450} className="text-center mb-8">
        <h2 className="inline-block bg-yellow-400 px-6 sm:px-10 py-1.5 sm:py-2 text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
          Blogs
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Stay updated with our latest news and trends
        </p>
      </FadeIn>

      <FadeIn direction="up" delay={500} className="w-full max-w-2xl px-4">
        <Link href={href} className="group block overflow-hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={imageSrc}
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-xl sm:text-2xl font-medium text-neutral-900 group-hover:text-yellow-600 transition-colors">
              {blog.title}
            </h2>
          </div>
        </Link>
      </FadeIn>
    </div>
  );
}
