import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { ADMIN_BLOGS_URL } from "@/constants/apis";

/* ================= TYPES ================= */

export type BlogPayload = {
  brandId: string;
  title: string;
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
        url: ADMIN_BLOGS_URL,
        method: "POST",
        data: payload,
        requiresAuth: true, // still needed
      });
    } catch (error) {
      throw handleApiError(error, "createBlog");
    }
  }

  /* ---------------- BULK CREATE ---------------- */
  static async bulkCreate(payload: { blogs: BlogPayload[] }): Promise<unknown> {
    try {
      const res = await httpClient.request<{ data: unknown }>({
        url: `${ADMIN_BLOGS_URL}/bulk`,
        method: "POST",
        data: payload,
        requiresAuth: true,
      });

      return res.data;
    } catch (error) {
      throw handleApiError(error, "bulkCreateBlogs");
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
        url: ADMIN_BLOGS_URL,
        method: "GET",
        params,
        requiresAuth: true,
      });

      return res.data;
    } catch (error) {
      throw handleApiError(error, "getBlogs");
    }
  }

  /* ---------------- UPDATE ---------------- */
  static async update(
    id: string,
    payload: Partial<BlogPayload>
  ): Promise<void> {
    try {
      await httpClient.request({
        url: `${ADMIN_BLOGS_URL}/${id}`,
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
        url: `${ADMIN_BLOGS_URL}/${id}`,
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteBlog");
    }
  }
}