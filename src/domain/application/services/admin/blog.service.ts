import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { BLOGS_URL } from "@/constants/apis";

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
  isPublished: boolean;
  createdAt: string;
};

export type BlogDetails = BlogPayload & {
  _id: string;
  slug?: string;
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

/* ================= SERVICE ================= */

export class BlogService {
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

  /* ---------------- GET ALL ---------------- */
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
      const res = await httpClient.request<BlogListResponse>({
        url: BLOGS_URL,
        method: "GET",
        params,
      });

      return res;
    } catch (error) {
      throw handleApiError(error, "getBlogs");
    }
  }

  /* ---------------- GET BY ID ---------------- */
  static async getById(id: string): Promise<BlogDetails> {
    try {
      const res = await httpClient.request<{ data: BlogDetails } | BlogDetails>({
        url: `${BLOGS_URL}/${id}`,
        method: "GET",
        requiresAuth: true,
      });

      if (res && typeof res === "object" && "data" in res) {
        return (res as { data: BlogDetails }).data;
      }

      return res as BlogDetails;
    } catch (error) {
      throw handleApiError(error, "getBlogById");
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