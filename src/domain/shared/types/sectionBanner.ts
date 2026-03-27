export interface SectionBanner {
    _id: string;
    sectionKey: string;
    image: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface SectionBannerPayload {
    sectionKey: string;
    image: string;
    isActive?: boolean;
  }
  
  export interface AdminSectionBannerResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export interface SectionBannerResponse<T> {
    success: boolean;
    data: T;
  }