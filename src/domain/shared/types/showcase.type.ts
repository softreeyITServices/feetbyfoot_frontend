export type ShowcaseMediaType = "image" | "video";

export interface Showcase {
  _id: string;
  mediaUrl: string;
  mediaType: ShowcaseMediaType;
  caption: string;
  customerName?: string;
  ctaLink?: string;
  isActive: boolean;
  position?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateShowcasePayload {
  mediaUrl: string;
  mediaType: ShowcaseMediaType;
  caption: string;
  customerName?: string;
  ctaLink?: string;
  isActive: boolean;
  position?: number;
}

export interface UpdateShowcasePayload {
  mediaUrl: string;
  mediaType: ShowcaseMediaType;
  caption: string;
  customerName?: string;
  ctaLink?: string;
  isActive: boolean;
  position?: number;
}

export interface ShowcaseResponse {
  message: string;
  data: Showcase;
}

export interface ShowcaseListResponse {
  message: string;
  data: {
    data: Showcase[];
  };
}
