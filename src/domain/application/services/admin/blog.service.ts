import { httpClient } from "@/lib/httpClient";
import { normalizeCoverImageUrl } from "@/lib/safeImageSrc";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { BLOGS_URL, BLOGS_URL_USER } from "@/constants/apis";

/* ================= TYPES ================= */

export type BlogPayload = {
  brandId?: string;
  title: string;
  slug?: string;
  excerpt: string;
  coverImage: {
    url: string;
    publicId: string;
  };
  sections: {
    heading: string;
    content: string;
    bullets: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  tags: string[];
  authorName: string;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type Blog = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName?: string;
  coverImage?: {
    url?: string;
    publicId?: string;
  };
  isPublished: boolean;
  createdAt: string;
};

export type BlogDetails = Blog & {
  brandId?: string;
  coverImage?: {
    url?: string;
    publicId?: string;
  };
  sections?: {
    heading: string;
    content: string;
    bullets: string[];
  }[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export type BlogListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  items: Blog[];
};

export type BlogComment = {
  _id?: string;
  blogId?: string;
  name: string;
  email: string;
  comment: string;
  status?: string;
  createdAt?: string;
};

type UnknownRecord = Record<string, unknown>;

/* ================= SERVICE ================= */

export class BlogService {
  private static unwrapData<T>(input: unknown): T | null {
    if (input === null || input === undefined) return null;
    if (Array.isArray(input)) return input as T;
    if (typeof input !== "object") return null;

    const maybe = input as { data?: unknown };
    if ("data" in maybe) {
      return BlogService.unwrapData<T>(maybe.data);
    }

    return input as T;
  }

  private static asObject(input: unknown): UnknownRecord | null {
    if (!input || typeof input !== "object" || Array.isArray(input)) return null;
    return input as UnknownRecord;
  }

  private static normalizeBlog(input: unknown): Blog | null {
    const obj = BlogService.asObject(input);
    if (!obj) return null;

    const id = typeof obj._id === "string" ? obj._id : "";
    const title = typeof obj.title === "string" ? obj.title : "";
    const slug = typeof obj.slug === "string" ? obj.slug : id;
    const excerpt = typeof obj.excerpt === "string" ? obj.excerpt : "";
    const authorName = typeof obj.authorName === "string" ? obj.authorName : undefined;
    const isPublished = Boolean(obj.isPublished);
    const createdAt =
      typeof obj.createdAt === "string" ? obj.createdAt : new Date().toISOString();

    if (!id || !title) return null;

    const coverImageRaw = BlogService.asObject(obj.coverImage);
    let coverImage: Blog["coverImage"];
    if (coverImageRaw) {
      const url = normalizeCoverImageUrl(coverImageRaw.url);
      const publicId =
        typeof coverImageRaw.publicId === "string" ? coverImageRaw.publicId : undefined;
      if (url || publicId) {
        coverImage = { ...(url ? { url } : {}), ...(publicId ? { publicId } : {}) };
      }
    }

    return {
      _id: id,
      title,
      slug,
      excerpt,
      authorName,
      isPublished,
      createdAt,
      coverImage,
    };
  }

  private static normalizeBlogDetails(input: unknown): BlogDetails | null {
    const obj = BlogService.asObject(input);
    if (!obj) return null;

    const baseBlog = BlogService.normalizeBlog(obj);
    if (!baseBlog) return null;

    const sections = Array.isArray(obj.sections)
      ? obj.sections
          .map((section) => {
            const s = BlogService.asObject(section);
            if (!s) return null;
            return {
              heading: typeof s.heading === "string" ? s.heading : "",
              content: typeof s.content === "string" ? s.content : "",
              bullets: Array.isArray(s.bullets)
                ? s.bullets.filter((b): b is string => typeof b === "string")
                : [],
            };
          })
          .filter((section): section is NonNullable<BlogDetails["sections"]>[number] => Boolean(section))
      : [];

    const faqs = Array.isArray(obj.faqs)
      ? obj.faqs
          .map((faq) => {
            const f = BlogService.asObject(faq);
            if (!f) return null;
            return {
              question: typeof f.question === "string" ? f.question : "",
              answer: typeof f.answer === "string" ? f.answer : "",
            };
          })
          .filter((faq): faq is NonNullable<BlogDetails["faqs"]>[number] => Boolean(faq))
      : [];

    const tags = Array.isArray(obj.tags)
      ? obj.tags.filter((tag): tag is string => typeof tag === "string")
      : [];

    const seoTitle = typeof obj.seoTitle === "string" ? obj.seoTitle : "";
    const seoDescription =
      typeof obj.seoDescription === "string" ? obj.seoDescription : "";

    return {
      ...baseBlog,
      brandId: typeof obj.brandId === "string" ? obj.brandId : undefined,
      authorName: typeof obj.authorName === "string" ? obj.authorName : "",
      seoTitle,
      seoDescription,
      sections,
      faqs,
      tags,
    };
  }

  private static normalizeComment(input: unknown): BlogComment | null {
    const obj = BlogService.asObject(input);
    if (!obj) return null;

    const comment =
      typeof obj.comment === "string"
        ? obj.comment
        : typeof obj.message === "string"
          ? obj.message
          : "";
    const name = typeof obj.name === "string" ? obj.name : "";
    const email = typeof obj.email === "string" ? obj.email : "";

    if (!comment) return null;

    return {
      _id: typeof obj._id === "string" ? obj._id : undefined,
      blogId: typeof obj.blogId === "string" ? obj.blogId : undefined,
      name: name || "Anonymous",
      email,
      comment,
      status: typeof obj.status === "string" ? obj.status : undefined,
      createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
    };
  }

  /* ---------------- CREATE ---------------- */
  static async create(payload: BlogPayload): Promise<void> {
    try {
      await httpClient.request({
        url: BLOGS_URL,
        method: "POST",
        data: payload,
        requiresAuth: true, // still needed
      });
    } catch (error) {
      throw handleApiError(error, "createBlog");
    }
  }

  /**
   * Shared list parsing for both admin (`/api/admin/blogs` → external `/admin/blogs`)
   * and public (`/api/blogs` → external `/blogs`).
   */
  private static async fetchBlogList(
    url: string,
    params?: {
      tag?: string;
      isPublished?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    },
    options?: { requiresAuth?: boolean; skipAuth?: boolean }
  ): Promise<BlogListResponse> {
    const res = await httpClient.request<unknown>({
      url,
      method: "GET",
      params,
      ...(options?.requiresAuth ? { requiresAuth: true } : {}),
      ...(options?.skipAuth ? { skipAuth: true } : {}),
    });

    const unwrapped = BlogService.unwrapData<unknown>(res);
    const obj = BlogService.asObject(unwrapped);

    const rawItems = obj && Array.isArray(obj.items)
      ? obj.items
      : Array.isArray(unwrapped)
        ? unwrapped
        : [];

    const items = rawItems
      .map((item) => BlogService.normalizeBlog(item))
      .filter((blog): blog is Blog => Boolean(blog));

    const metaRaw = obj ? BlogService.asObject(obj.meta) : null;
    const meta = {
      page: typeof metaRaw?.page === "number" ? metaRaw.page : params?.page ?? 1,
      limit: typeof metaRaw?.limit === "number" ? metaRaw.limit : params?.limit ?? items.length,
      total: typeof metaRaw?.total === "number" ? metaRaw.total : items.length,
      pages: typeof metaRaw?.pages === "number" ? metaRaw.pages : 1,
    };

    return { meta, items };
  }

  /* ---------------- GET ALL (ADMIN) ---------------- */
  static async getAll(
    params?: {
      tag?: string;
      isPublished?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<BlogListResponse> {
    try {
      return await BlogService.fetchBlogList(BLOGS_URL, params, {
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "getBlogs");
    }
  }

  /* ---------------- GET BY ID ---------------- */
  static async getById(id: string): Promise<BlogDetails> {
    try {
      const res = await httpClient.request<unknown>({
        url: `${BLOGS_URL}/${id}`,
        method: "GET",
        requiresAuth: true,
      });
      const unwrapped = BlogService.unwrapData<unknown>(res);
      const normalized = BlogService.normalizeBlogDetails(unwrapped);
      if (!normalized) {
        throw new Error("Invalid blog details response");
      }
      return normalized;
    } catch (error) {
      throw handleApiError(error, "getBlogById");
    }
  }

  /* ---------------- GET PUBLIC LIST ---------------- */
  static async getPublicList(params?: {
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BlogListResponse> {
    try {
      return await BlogService.fetchBlogList(
        BLOGS_URL_USER,
        { ...params, isPublished: true },
        { skipAuth: true }
      );
    } catch (error) {
      throw handleApiError(error, "getPublicBlogs");
    }
  }

  /* ---------------- GET PUBLIC BLOG ---------------- */
  static async getPublicBySlugOrId(identifier: string): Promise<BlogDetails | null> {
    const normalizedIdentifier = identifier?.trim();
    if (!normalizedIdentifier) return null;

    try {
      const res = await httpClient.request<unknown>({
        url: `${BLOGS_URL_USER}/${normalizedIdentifier}`,
        method: "GET",
        skipAuth: true,
      });
      const normalized = BlogService.normalizeBlogDetails(
        BlogService.unwrapData<unknown>(res)
      );
      if (normalized && normalized.isPublished) {
        return normalized;
      }
    } catch {
      // Ignore and attempt a slug search fallback.
    }

    const list = await BlogService.getPublicList({
      search: normalizedIdentifier,
      page: 1,
      limit: 50,
    });

    const matched =
      list.items.find((blog) => blog.slug === normalizedIdentifier) ??
      list.items.find((blog) => blog._id === normalizedIdentifier) ??
      null;

    if (!matched?._id) return null;

    try {
      const detailRes = await httpClient.request<unknown>({
        url: `${BLOGS_URL_USER}/${matched._id}`,
        method: "GET",
        skipAuth: true,
      });

      return (
        BlogService.normalizeBlogDetails(BlogService.unwrapData<unknown>(detailRes)) ??
        null
      );
    } catch {
      return null;
    }
  }

  /* ---------------- GET COMMENTS ---------------- */
  static async getCommentsByBlogId(blogId: string): Promise<BlogComment[]> {
    try {
      const res = await httpClient.request<unknown>({
        url: `${BLOGS_URL_USER}/${blogId}/comments`,
        method: "GET",
        skipAuth: true,
      });

      const unwrapped = BlogService.unwrapData<unknown>(res);
      const obj = BlogService.asObject(unwrapped);
      const rawComments =
        obj && Array.isArray(obj.items)
          ? obj.items
          : obj && Array.isArray(obj.comments)
            ? obj.comments
            : Array.isArray(unwrapped)
              ? unwrapped
              : [];

      return rawComments
        .map((comment) => BlogService.normalizeComment(comment))
        .filter((comment): comment is BlogComment => Boolean(comment));
    } catch (error) {
      throw handleApiError(error, "getBlogComments");
    }
  }

  /* ---------------- CREATE COMMENT ---------------- */
  static async createComment(payload: {
    blogId: string;
    name: string;
    email: string;
    comment: string;
  }): Promise<void> {
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const accessToken = (session as { accessToken?: string } | null)
        ?.accessToken;

      const headers: Record<string, string> = {};
      if (typeof accessToken === "string" && accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      await httpClient.request({
        url: `${BLOGS_URL_USER}/${payload.blogId}/comments`,
        method: "POST",
        data: {
          name: payload.name,
          email: payload.email,
          comment: payload.comment,
        },
        skipAuth: true,
        ...(Object.keys(headers).length > 0 ? { headers } : {}),
      });
    } catch (error) {
      throw handleApiError(error, "createBlogComment");
    }
  }

  /* ---------------- UPDATE ---------------- */
  static async update(
    id: string,
    payload: Partial<BlogPayload>
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${BLOGS_URL}/${id}`,
        method: "PATCH",
        data: payload,
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "updateBlog");
    }
  }

  /* ---------------- DELETE ---------------- */
  static async delete(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: `${BLOGS_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteBlog");
    }
  }
}