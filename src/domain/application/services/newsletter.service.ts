import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { NEWSLETTER_SUBSCRIBE_URL } from "@/constants/apis";

interface SubscribeNewsletterResponse {
  message: string;
  alreadySubscribed: boolean;
}

class NewsletterService {
  async subscribe(email: string): Promise<SubscribeNewsletterResponse> {
    try {
      const response = await httpClient.request<SubscribeNewsletterResponse>({
        url: NEWSLETTER_SUBSCRIBE_URL,
        method: "POST",
        skipAuth: true,
        data: { email },
      });
      return response;
    } catch (error) {
      handleApiError(error, "subscribeNewsletter");
      throw error;
    }
  }
}

export const newsletterService = new NewsletterService();

export class NewsletterAdminService {
  static async getAll() {
    const { NEWSLETTER_LIST_URL } = await import("@/constants/apis");
    const res: any = await httpClient.request<any>({
      url: NEWSLETTER_LIST_URL,
      method: "GET",
      requiresAuth: true,
    });
    return Array.isArray(res) ? res : res?.data ?? [];
  }
}
