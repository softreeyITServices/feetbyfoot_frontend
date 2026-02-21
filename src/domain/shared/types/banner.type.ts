export interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateBannerPayload {
  title: string;
  imageUrl: string;
  isActive: boolean;
}

export interface UpdateBannerPayload {
  title: string;
  imageUrl: string;
  isActive: boolean;
}

export interface BannerResponse {
  message: string;
  data: Banner;
}

export interface BannerListResponse {
  message: string;
  data: {
    data: Banner[];
  }
}
