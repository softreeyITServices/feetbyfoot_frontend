"use client";

import { BlogService, type Blog } from "@/domain/application/services/admin/blog.service";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BlogCard = {
  id: string;
  title: string;
  href: string;
  coverUrl: string;
  imageAlt: string;
};

const FALLBACK_IMAGE = "/assets/images/Frame 44.png";

/** Returns true when a URL points to a video (Cloudinary or extension-based) */
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.includes("/video/upload/")) return true;
  return /\.(mp4|webm|mov|ogg|avi|mkv)(\?|#|$)/i.test(url);
}

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
        if (isMounted) setLoading(false);
      }
    };

    void loadBlogs();
    return () => { isMounted = false; };
  }, []);

  const cards = useMemo<BlogCard[]>(
    () =>
      blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        href: `/blogs/${blog._id}`,
        coverUrl: blog.coverImage?.url || "",
        imageAlt: blog.title || "Blog cover",
      })),
    [blogs]
  );

  return (
    <>
      <main className="bg-white">
        <div className="mx-auto max-w-245 px-4 py-10">
          {/* Header */}
          <header className="text-center">
            <div className="mx-auto inline-flex items-center justify-center bg-[#F2C100] px-14 py-2">
              <h1 className="text-[16px] font-semibold text-neutral-900">Blogs</h1>
            </div>
            <p className="mt-2 text-[10px] text-neutral-500">
              Stay updated with our latest news and trends
            </p>
          </header>

          {/* Grid */}
          <section className="mt-8">
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-3">
              {loading ? (
                <p className="text-[12px] text-neutral-500">Loading blogs...</p>
              ) : hasError ? (
                <p className="text-[12px] text-neutral-500">Unable to load blogs right now.</p>
              ) : cards.length === 0 ? (
                <p className="text-[12px] text-neutral-500">No blogs available.</p>
              ) : (
                cards.map((b) => <BlogTile key={b.id} blog={b} />)
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function BlogTile({ blog }: { blog: BlogCard }) {
  const [imgError, setImgError] = useState(false);
  const isVideo = isVideoUrl(blog.coverUrl);
  const hasUrl = Boolean(blog.coverUrl?.trim());

  return (
    <article className="w-full">
      <Link href={blog.href} className="block">
        {/* fixed aspect ratio so all cards are uniform height */}
        <div className="overflow-hidden bg-neutral-100 aspect-[3/2]">
          {isVideo && hasUrl ? (
            <video
              src={blog.coverUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : hasUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blog.coverUrl}
              alt={blog.imageAlt}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={FALLBACK_IMAGE}
              alt={blog.imageAlt}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <h2 className="mt-4 font-normal text-[20px] leading-[150%] tracking-normal text-neutral-900 line-clamp-2">
          {blog.title}
        </h2>
      </Link>
    </article>
  );
}