"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogService, type Blog } from "@/domain/application/services/admin/blog.service";
import FadeIn from "../ui/FadeIn";

const FALLBACK_IMAGE = "/assets/images/Frame 44.png";

/** Returns true when a URL points to a video (Cloudinary or extension-based) */
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.includes("/video/upload/")) return true;
  return /\.(mp4|webm|mov|ogg|avi|mkv)(\?|#|$)/i.test(url);
}

export default function HomeBlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const res = await BlogService.getPublicList({ page: 1, limit: 3 });
        if (res.items && res.items.length > 0) {
          setBlogs(res.items);
        }
      } catch (error) {
        console.error("Error fetching latest blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBlogs();
  }, []);

  if (loading || blogs.length === 0) {
    return null;
  }

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

      <div className="w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, index) => (
            <BlogCard key={blog._id} blog={blog} delay={500 + index * 100} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog, delay }: { blog: Blog; delay: number }) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = blog.coverImage?.url || "";
  const href = `/blogs/${blog._id}`;
  const isVideo = isVideoUrl(coverUrl);
  const hasUrl = Boolean(coverUrl.trim());

  return (
    <FadeIn direction="up" delay={delay} className="w-full">
      <Link href={href} className="group block overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
          {isVideo && hasUrl ? (
            <video
              src={coverUrl}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : hasUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={FALLBACK_IMAGE}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-lg sm:text-xl font-medium text-neutral-900 group-hover:text-yellow-600 transition-colors line-clamp-2">
            {blog.title}
          </h2>
        </div>
      </Link>
    </FadeIn>
  );
}
