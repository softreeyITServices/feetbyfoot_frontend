import { ADMIN_UPLOAD_URL } from "@/constants/apis";
import { httpClient } from "@/lib/httpClient";
import { handleApiError } from "@/lib/serviceErrorHandler";

type UploadResponse = {
  success?: boolean;
  url?: string;
  data?: {
    url: string;
  };
};

class UploadService {
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await httpClient.request<UploadResponse>({
        url: ADMIN_UPLOAD_URL,
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response) {
        throw new Error("Invalid upload response");
      }

      // Support both response formats
      const url = response.url || response?.data?.url;

      if (!url) {
        throw new Error("URL not found in upload response");
      }

      return url;
    } catch (error) {
      handleApiError(error, "uploadFile");
      throw error; // 🔥 important
    }
  }
}

export const uploadService = new UploadService();