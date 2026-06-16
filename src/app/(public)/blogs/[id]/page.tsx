"use client";

import {
  BlogService,
  type BlogComment,
  type BlogDetails,
} from "@/domain/application/services/admin/blog.service";
import { safeNextImageSrc } from "@/lib/safeImageSrc";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

const FALLBACK_IMAGE = "/assets/images/Frame 44.png";

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const blogIdOrSlug = params?.id ?? "";

  const [blog, setBlog] = React.useState<BlogDetails | null>(null);
  const [comments, setComments] = React.useState<BlogComment[]>([]);
  const [blogLoading, setBlogLoading] = React.useState(true);
  const [commentsLoading, setCommentsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    comment: "",
  });

  const fetchBlog = React.useCallback(async () => {
    if (!blogIdOrSlug) return;
    try {
      setBlogLoading(true);
      setError("");
      const blogRes = await BlogService.getPublicBySlugOrId(blogIdOrSlug);
      setBlog(blogRes);
    } catch {
      setError("Unable to load blog right now.");
      setBlog(null);
    } finally {
      setBlogLoading(false);
    }
  }, [blogIdOrSlug]);

  const fetchComments = React.useCallback(async (id: string) => {
    if (!id) return;
    try {
      setCommentsLoading(true);
      const commentsRes = await BlogService.getCommentsByBlogId(id);
      setComments(commentsRes);
    } catch (err) {
      console.error("Comments fetch failed:", err);
      // Don't set global error, just log it. Comments are non-critical.
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchBlog();
  }, [fetchBlog]);

  React.useEffect(() => {
    if (blog?._id) {
      void fetchComments(blog._id);
    }
  }, [blog?._id, fetchComments]);

  console.log("blog",blog)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!blog?._id || isSubmitting) return;

    const payload = {
      blogId: blog._id,
      name: form.name.trim(),
      email: form.email.trim(),
      comment: form.comment.trim(),
    };

    if (!payload.name || !payload.email || !payload.comment) {
      setSubmitMessage("Please fill all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage("");
      await BlogService.createComment(payload);
      setSubmitMessage("Thanks! Your comment has been submitted.");
      setForm({ name: "", email: "", comment: "" });
      const commentsRes = await BlogService.getCommentsByBlogId(blog._id);
      setComments(commentsRes);
    } catch {
      setSubmitMessage("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (blogLoading) {
    return (
      <>
        <main className="bg-white">
          <div className="mx-auto max-w-245 px-4 py-10">
            <p className="text-center text-[14px] text-neutral-500">Loading blog...</p>
          </div>
        </main>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <main className="bg-white">
          <div className="mx-auto max-w-245 px-4 py-10">
            <p className="text-center text-[14px] text-neutral-500">
              {error || "Blog not found."}
            </p>
          </div>
        </main>
      </>
    );
  }

  const displayDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const sections = blog.sections ?? [];
  const faqs = blog.faqs ?? [];
  const tags = blog.tags ?? [];

  return (
    <>
      <main className="bg-white">
        <div className="mx-auto max-w-245 px-4 py-10">
          {/* Title */}
          <div className="text-center">
            <h1 className="font-normal text-[22px] leading-[150%] text-neutral-900">
              {blog.title}
            </h1>

            <p className="mt-2 text-[12px] text-neutral-500">
              By {blog.authorName?.trim() || "Feet by Foot"}
              {displayDate ? ` - ${displayDate}` : ""}
            </p>
          </div>

          {/* Hero Media */}
          <HeroMedia
            url={blog.coverImage?.url || ""}
            alt={blog.title || "Blog image"}
          />

          {/* Article Content */}
          <article className="mx-auto mt-8 max-w-190 text-[14px] leading-[170%] text-neutral-700">
            {blog.excerpt ? <p>{blog.excerpt}</p> : null}

            {sections.map((section, index) => (
              <section className="mt-6" key={`${section.heading}-${index}`}>
                {section.heading ? (
                  <h2 className="text-[16px] font-semibold text-emerald-700">
                    {section.heading}
                  </h2>
                ) : null}

                {section.content ? <p className="mt-3">{section.content}</p> : null}

                {section.bullets?.length ? (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {faqs.length ? (
              <>
                <div className="my-10 h-px bg-neutral-200" />

                <section>
                  <h2 className="text-[18px] font-semibold text-neutral-900">
                    Frequently Asked Questions (FAQs)
                  </h2>

                  <div className="mt-6 space-y-6">
                    {faqs.map((faq, index) => (
                      <FaqItem
                        key={`${faq.question}-${index}`}
                        question={faq.question}
                        answer={faq.answer}
                      />
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            {/* Divider */}
            <div className="my-10 h-px bg-neutral-200" />

            {/* Tags + Share */}
            <div className="flex flex-col gap-6 text-[12px] sm:flex-row sm:items-center sm:justify-between">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-neutral-700">Tags:</span>
                {tags.length ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                    General
                  </span>
                )}
              </div>

              {/* Share */}
              <div className="flex items-center gap-3">
                <span className="font-medium text-neutral-700">Share:</span>

                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-neutral-300 text-[12px] text-neutral-500 hover:bg-neutral-100"
                  aria-label="Share on Facebook"
                >
                  F
                </button>

                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-neutral-300 text-[12px] text-neutral-500 hover:bg-neutral-100"
                  aria-label="Share on Twitter"
                >
                  T
                </button>

                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-neutral-300 text-[12px] text-neutral-500 hover:bg-neutral-100"
                  aria-label="Share on Instagram"
                >
                  I
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="my-10 h-px bg-neutral-200" />

            {/* Comments */}
            {comments.length ? (
              <>
                <section>
                  <h2 className="text-[18px] font-semibold text-neutral-900">Comments</h2>
                  <div className="mt-6 space-y-5">
                    {comments.map((comment, index) => (
                      <div key={`${comment._id || comment.email}-${index}`}>
                        <p className="text-[14px] font-medium text-neutral-900">
                          {comment.name}
                        </p>
                        <p className="mt-1 text-[14px] leading-[170%] text-neutral-700">
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="my-10 h-px bg-neutral-200" />
              </>
            ) : null}

            {/* Leave a Reply */}
            <section>
              <h2 className="text-[18px] font-semibold text-neutral-900">
                Leave a Reply
              </h2>

              <p className="mt-3 text-[13px] text-neutral-600">
                Your email address will not be published. Required fields are marked *
              </p>

              <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                {/* Name + Email */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-md border border-neutral-200 px-4 py-3 text-[14px] text-neutral-800 outline-none focus:border-emerald-500"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded-md border border-neutral-200 px-4 py-3 text-[14px] text-neutral-800 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Comment */}
                <textarea
                  rows={8}
                  placeholder="Comment"
                  value={form.comment}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  className="w-full rounded-md border border-neutral-200 px-4 py-3 text-[14px] text-neutral-800 outline-none focus:border-emerald-500"
                />

                {submitMessage ? (
                  <p className="text-[13px] text-neutral-600">{submitMessage}</p>
                ) : null}

                {/* Submit Button */}
                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-neutral-900 px-10 py-3 text-[13px] font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}{" "}
                    <span aria-hidden>↗️</span>
                  </button>
                </div>
              </form>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

/** Returns true when a Cloudinary/general URL points to a video */
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.includes('/video/upload/')) return true;
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
}

function HeroMedia({ url, alt }: { url: string; alt: string }) {
  const [imgSrc, setImgSrc] = React.useState(url || FALLBACK_IMAGE);

  React.useEffect(() => {
    setImgSrc(url || FALLBACK_IMAGE);
  }, [url]);

  if (isVideoUrl(url)) {
    return (
      <div className="mt-6 overflow-hidden">
        <video
          src={url}
          className="h-auto w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          controls
        />
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden">
      <Image
        src={safeNextImageSrc(imgSrc, FALLBACK_IMAGE)}
        alt={alt}
        width={1600}
        height={900}
        className="h-auto w-full object-cover"
        priority
        onError={() => setImgSrc(FALLBACK_IMAGE)}
      />
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-b border-neutral-200 pb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold text-neutral-900">{question}</span>
        <span className="text-neutral-500">{open ? "-" : "+"}</span>
      </button>

      {open ? (
        <p className="mt-3 text-[14px] leading-[170%] text-neutral-700">{answer}</p>
      ) : null}
    </div>
  );
}