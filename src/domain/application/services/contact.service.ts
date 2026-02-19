import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";
import { CONTACT_URL } from "@/constants/apis";
import {
  CreateContactRequest,
  Contact,
} from "@/domain/shared/types/contact.type";

class ContactService {
  /* ---------------- CREATE CONTACT ---------------- */
  async createContact(
    payload: CreateContactRequest
  ): Promise<Contact> {
    try {
      const response = await httpClient.request<Contact>({
        url: CONTACT_URL,
        method: "POST",
        data: payload,
      });

      return response;
    } catch (error) {
      handleApiError(error, "createContact");
      throw error;
    }
  }

  /* ---------------- GET CONTACTS ---------------- */
  async getContacts(): Promise<Contact[]> {
    try {
      const response = await httpClient.request<Contact[]>({
        url: CONTACT_URL,
        method: "GET",
        requiresAuth: true,
      });

      return response;
    } catch (error) {
      handleApiError(error, "getContacts");
      throw error;
    }
  }

  /* ---------------- RESOLVE CONTACT ---------------- */
  async resolveContact(id: string): Promise<Contact> {
    try {
      const response = await httpClient.request<Contact>({
        url: `${CONTACT_URL}/${id}/resolve`,
        method: "PATCH",
        requiresAuth: true,
      });

      return response;
    } catch (error) {
      handleApiError(error, "resolveContact");
      throw error;
    }
  }
}

export const contactService = new ContactService();
