import { handleApiError } from "@/lib/serviceErrorHandler";
import { httpClient } from "@/lib/httpClient";
import {
  ANNOUNCEMENTS_ADMIN_URL,
  ANNOUNCEMENTS_PUBLIC_URL,
  announcementsAdminByIdUrl,
  EX_ANNOUNCEMENTS_PUBLIC_URL,
} from "@/constants/apis";
import type {
  Announcement,
  CreateAnnouncementBody,
  UpdateAnnouncementBody,
} from "@/domain/shared/types/announcement";

export class AnnouncementService {
  private static publicBaseUrl(): string {
    if (typeof window === "undefined" && process.env.API_URL) {
      return EX_ANNOUNCEMENTS_PUBLIC_URL;
    }
    return ANNOUNCEMENTS_PUBLIC_URL;
  }

  private static pickAnnouncementArray(payload: unknown): Announcement[] {
    let cur: unknown = payload;
    for (let i = 0; i < 6; i++) {
      if (Array.isArray(cur)) {
        return cur as Announcement[];
      }
      if (!cur || typeof cur !== "object") break;
      const o = cur as Record<string, unknown>;
      if ("data" in o) {
        const next = o.data;
        if (Array.isArray(next)) {
          return next as Announcement[];
        }
        cur = next;
        continue;
      }
      break;
    }
    return [];
  }

  private static pickAnnouncement(payload: unknown): Announcement | null {
    let cur: unknown = payload;
    for (let i = 0; i < 6; i++) {
      if (!cur || typeof cur !== "object") break;
      const o = cur as Record<string, unknown>;
      if (
        "_id" in o &&
        typeof o._id === "string" &&
        "message" in o &&
        typeof o.message === "string"
      ) {
        return o as Announcement;
      }
      if ("data" in o) {
        cur = o.data;
        continue;
      }
      break;
    }
    return null;
  }

  static async getPublic(): Promise<Announcement[]> {
    try {
      const base = AnnouncementService.publicBaseUrl();
      const res = await httpClient.request<unknown>({
        url: base,
        method: "GET",
        skipAuth: true,
      });
      return AnnouncementService.pickAnnouncementArray(res);
    } catch (error) {
      throw handleApiError(error, "getPublicAnnouncements");
    }
  }

  static async listAdmin(isActive?: boolean): Promise<Announcement[]> {
    try {
      const params: Record<string, string> = {};
      if (isActive === true) params.isActive = "true";
      if (isActive === false) params.isActive = "false";

      const res = await httpClient.request<unknown>({
        url: ANNOUNCEMENTS_ADMIN_URL,
        method: "GET",
        params: Object.keys(params).length ? params : undefined,
        requiresAuth: true,
      });
      return AnnouncementService.pickAnnouncementArray(res);
    } catch (error) {
      throw handleApiError(error, "listAdminAnnouncements");
    }
  }

  static async getByIdAdmin(id: string): Promise<Announcement> {
    try {
      const res = await httpClient.request<unknown>({
        url: announcementsAdminByIdUrl(id),
        method: "GET",
        requiresAuth: true,
      });
      const one = AnnouncementService.pickAnnouncement(res);
      if (!one) {
        throw new Error("Announcement not found");
      }
      return one;
    } catch (error) {
      throw handleApiError(error, "getAnnouncement");
    }
  }

  static async create(body: CreateAnnouncementBody): Promise<Announcement> {
    try {
      const res = await httpClient.request<unknown>({
        url: ANNOUNCEMENTS_ADMIN_URL,
        method: "POST",
        data: body,
        requiresAuth: true,
      });
      const one = AnnouncementService.pickAnnouncement(res);
      if (!one) {
        throw new Error("Invalid create response");
      }
      return one;
    } catch (error) {
      throw handleApiError(error, "createAnnouncement");
    }
  }

  static async update(
    id: string,
    body: UpdateAnnouncementBody
  ): Promise<Announcement> {
    try {
      const res = await httpClient.request<unknown>({
        url: announcementsAdminByIdUrl(id),
        method: "PATCH",
        data: body,
        requiresAuth: true,
      });
      const one = AnnouncementService.pickAnnouncement(res);
      if (!one) {
        throw new Error("Invalid update response");
      }
      return one;
    } catch (error) {
      throw handleApiError(error, "updateAnnouncement");
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await httpClient.request({
        url: announcementsAdminByIdUrl(id),
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      throw handleApiError(error, "deleteAnnouncement");
    }
  }
}
