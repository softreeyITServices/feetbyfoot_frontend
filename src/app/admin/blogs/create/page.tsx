"use client";

import React, { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BlogService } from "@/domain/application/services/admin/blog.service";
import { uploadService } from "@/domain/application/services/upload.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { isGetRequestError } from "@/lib/httpClientError";

/* ================= TYPES ================= */

type Section = {
  heading: string;
  content: string;
  bullets: string[];
};

type FAQ = {
  question: string;
  answer: string;
};

/* ================= UPLOAD ICON ================= */

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

/* ================= FIELD WRAPPER ================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#006574] focus:ring-2 focus:ring-[#006574]/10 transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

const textareaCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#006574] focus:ring-2 focus:ring-[#006574]/10 transition resize-none";

/* ================= PAGE ================= */

function CreateBlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const blogId = searchParams.get("blogId");
  const isEditMode = Boolean(blogId);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [cover, setCover] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [sections, setSections] = useState<Section[]>([
    { heading: "", content: "", bullets: [""] },
  ]);

  const [faqs, setFaqs] = useState<FAQ[]>([{ question: "", answer: "" }]);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const brandId = session?.user?.brandId?.trim() ?? "";

  useEffect(() => {
    if (!blogId) return;

    const loadBlog = async () => {
      try {
        setLoadingBlog(true);
        const blog = await BlogService.getById(blogId);

        setTitle(blog.title || "");
        setExcerpt(blog.excerpt || "");
        setAuthorName(blog.authorName || "");
        setSlug(blog.slug || "");
        setSlugManuallyEdited(Boolean(blog.slug));
        setCover(blog.coverImage?.url || "");
        setSections(
          blog.sections && blog.sections.length > 0
            ? blog.sections
            : [{ heading: "", content: "", bullets: [""] }]
        );
        setFaqs(
          blog.faqs && blog.faqs.length > 0
            ? blog.faqs
            : [{ question: "", answer: "" }]
        );
        setTags(blog.tags || []);
        setSeoTitle(blog.seoTitle || "");
        setSeoDescription(blog.seoDescription || "");
      } catch (err: any) {
        if (!isGetRequestError(err)) {
          toast.error(err?.message || "Failed to load blog");
        }
      } finally {
        setLoadingBlog(false);
      }
    };

    loadBlog();
  }, [blogId]);

  useEffect(() => {
    if (isEditMode) return;
    const sessionName = session?.user?.name?.trim();
    if (!sessionName) return;
    setAuthorName((prev) => (prev.trim() ? prev : sessionName));
  }, [isEditMode, session?.user?.name]);

  /* ================= UPLOAD ================= */

  const handleUpload = async (file: File) => {
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadService.uploadFile(file);
      setCover(url);
      toast.success("Cover uploaded ✨");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  };

  /* ================= SECTION ================= */

  const addSection = () =>
    setSections([...sections, { heading: "", content: "", bullets: [""] }]);

  const updateSection = (index: number, data: Partial<Section>) => {
    const copy = [...sections];
    copy[index] = { ...copy[index], ...data };
    setSections(copy);
  };

  const removeSection = (index: number) =>
    setSections(sections.filter((_, i) => i !== index));

  const addBullet = (i: number) => {
    const copy = [...sections];
    copy[i].bullets.push("");
    setSections(copy);
  };

  const updateBullet = (i: number, j: number, value: string) => {
    const copy = [...sections];
    copy[i].bullets[j] = value;
    setSections(copy);
  };

  const removeBullet = (i: number, j: number) => {
    const copy = [...sections];
    copy[i].bullets = copy[i].bullets.filter((_, idx) => idx !== j);
    setSections(copy);
  };

  /* ================= FAQ ================= */

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);

  const updateFaq = (i: number, data: Partial<FAQ>) => {
    const copy = [...faqs];
    copy[i] = { ...copy[i], ...data };
    setFaqs(copy);
  };

  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));

  /* ================= TAG ================= */

  const addTag = () => {
    if (!tagInput.trim()) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const canPublish =
    Boolean(title.trim()) &&
    Boolean(slug.trim()) &&
    Boolean(excerpt.trim()) &&
    Boolean(authorName.trim()) &&
    Boolean(cover.trim());

  /* ================= SUBMIT ================= */

  const handleSubmit = async (isPublished: boolean) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const payload = {
        ...(brandId ? { brandId } : {}),
        title,
        slug,
        excerpt,
        coverImage: { url: cover, publicId: "" },
        sections,
        faqs,
        tags,
        authorName,
        isPublished,
        seoTitle,
        seoDescription,
      };

      if (isEditMode && blogId) {
        await BlogService.update(blogId, payload);
        toast.success(isPublished ? "Updated & published 🚀" : "Draft updated");
      } else {
        await BlogService.create(payload);
        toast.success(isPublished ? "Published 🚀" : "Draft saved");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  if (loadingBlog) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen font-sans flex items-center justify-center text-sm text-gray-500">
        Loading blog data...
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen font-sans">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-14 bg-white/80 backdrop-blur border-b border-gray-100 px-8 py-3.5 flex items-center justify-between z-40">
        <span className="text-sm font-semibold text-gray-500 tracking-wide">
          {isEditMode ? "Edit Blog Post" : "New Blog Post"}
        </span>
        <div className="flex gap-3">
          <button
            disabled={submitting}
            onClick={() => router.push("/admin/blogs")}
            className="text-sm px-5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Back to Blogs
          </button>
          <button
            disabled={submitting || !canPublish}
            onClick={() => handleSubmit(true)}
            className="text-sm bg-yellow-400 text-black px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : isEditMode ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </header>

      {/* ── COVER UPLOAD ── */}
      <label
        className={`block relative cursor-pointer h-64 transition-all ${
          dragging ? "ring-2 ring-[#006574] ring-inset" : ""
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleUpload(file);
        }}
      >
        {cover ? (
          /* ── Has cover ── */
          <div className="w-full h-full relative group">
            <img src={cover} className="w-full h-full object-cover" alt="cover" />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-3">
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow flex items-center gap-2">
                <UploadIcon />
                Change Cover
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setCover(""); }}
                className="text-white/80 text-xs underline hover:text-white"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div
            className={`w-full h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed transition-colors ${
              dragging
                ? "border-[#006574] bg-[#006574]/5"
                : "border-gray-200 bg-white hover:border-[#006574]/40 hover:bg-[#006574]/5"
            }`}
          >
            <UploadIcon />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                {uploading ? "Uploading…" : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-gray-300 mt-0.5">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </label>

      {/* ── BODY ── */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* Title */}
        <textarea
          placeholder="Post title…"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          rows={2}
          className="w-full text-4xl font-bold bg-transparent outline-none resize-none text-gray-900 placeholder:text-gray-200 leading-tight"
        />

        {/* Meta */}
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Slug">
            <input
              placeholder="my-blog-post"
              value={slug}
              onChange={(e) => { setSlugManuallyEdited(true); setSlug(e.target.value); }}
              className={inputCls}
            />
          </Field>
          <Field label="Author">
            <input
              placeholder="Jane Doe"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              disabled
              className={inputCls}
            />
          </Field>
        </div>

        {/* Excerpt */}
        <Field label="Excerpt">
          <textarea
            placeholder="A short summary shown in listing pages…"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className={textareaCls}
          />
        </Field>

        {/* ── DIVIDER ── */}
        <hr className="border-gray-100" />

        {/* SECTIONS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">
              Content Sections
            </h3>
            <button
              onClick={addSection}
              className="text-xs font-semibold text-[#006574] hover:underline"
            >
              + Add Section
            </button>
          </div>

          {sections.map((sec, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  placeholder="Section heading"
                  value={sec.heading}
                  onChange={(e) => updateSection(i, { heading: e.target.value })}
                  className="flex-1 text-base font-semibold bg-transparent outline-none text-gray-800 placeholder:text-gray-200"
                />
                <button
                  onClick={() => removeSection(i)}
                  className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <textarea
                placeholder="Write content here…"
                value={sec.content}
                onChange={(e) => updateSection(i, { content: e.target.value })}
                rows={4}
                className={textareaCls}
              />

              {/* Bullets */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-300 font-semibold">
                  Bullet Points
                </p>
                {sec.bullets.map((b, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-gray-300 text-sm">•</span>
                    <input
                      value={b}
                      placeholder="Bullet point…"
                      onChange={(e) => updateBullet(i, j, e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 outline-none focus:border-[#006574]/40 transition"
                    />
                    <button
                      onClick={() => removeBullet(i, j)}
                      className="text-gray-200 hover:text-red-400 transition text-base leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addBullet(i)}
                  className="text-xs text-[#006574] hover:underline mt-1"
                >
                  + Add Bullet
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── DIVIDER ── */}
        <hr className="border-gray-100" />

        {/* FAQs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">
              FAQs
            </h3>
            <button
              onClick={addFaq}
              className="text-xs font-semibold text-[#006574] hover:underline"
            >
              + Add FAQ
            </button>
          </div>

          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  placeholder="Question"
                  value={f.question}
                  onChange={(e) => updateFaq(i, { question: e.target.value })}
                  className="flex-1 font-medium text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-300"
                />
                <button
                  onClick={() => removeFaq(i)}
                  className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <textarea
                placeholder="Answer…"
                value={f.answer}
                onChange={(e) => updateFaq(i, { answer: e.target.value })}
                rows={3}
                className={textareaCls}
              />
            </div>
          ))}
        </div>

        {/* ── DIVIDER ── */}
        <hr className="border-gray-100" />

        {/* TAGS */}
        <Field label="Tags">
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 focus-within:border-[#006574] focus-within:ring-2 focus-within:ring-[#006574]/10 transition">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 px-3 py-1 bg-[#006574]/10 text-[#006574] rounded-full text-xs font-medium"
              >
                {t}
                <button
                  onClick={() => removeTag(t)}
                  className="ml-0.5 text-[#006574]/60 hover:text-[#006574] leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder={tags.length === 0 ? "Type a tag and press Enter…" : "Add more…"}
              className="flex-1 min-w-[120px] text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-300"
            />
          </div>
        </Field>

        {/* ── DIVIDER ── */}
        <hr className="border-gray-100" />

        {/* SEO */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">
            SEO
          </h3>
          <Field label="SEO Title">
            <input
              placeholder="Optimised title for search engines…"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="SEO Description">
            <textarea
              placeholder="Meta description (150–160 chars recommended)…"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              className={textareaCls}
            />
          </Field>
        </div>

        {/* ACTION FOOTER */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            disabled={submitting}
            onClick={() => router.push("/admin/blogs")}
            className="text-sm px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Back to Blogs
          </button>
          <button
            disabled={submitting || !canPublish}
            onClick={() => handleSubmit(true)}
            className="text-sm bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-yellow-500 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : isEditMode ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateBlogPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#f5f6f8] min-h-screen font-sans flex items-center justify-center text-sm text-gray-500">
          Loading blog editor...
        </div>
      }
    >
      <CreateBlogPageContent />
    </Suspense>
  );
}
