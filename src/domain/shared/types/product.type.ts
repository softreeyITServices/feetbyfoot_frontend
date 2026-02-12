// domain/shared/types/product.type.ts

export interface ProductSize {
  size: string;
  quantity: number;
  isActive: boolean;
  isInCart?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  brand: string;
  color: string;
  sizes: ProductSize[];
  price: number;
  salePrice: number;
  currency: string;
  imageUrls: string[];
  categoryId: string;
  categoryTypeId: string;
  gender: string[];
  tags: string[];
  isActive: boolean;
  length: string;
  isFeatured: boolean;
  ratingAverage: number;
  totalRatings: number;
  isInWishlist: boolean;
  reviews: ProductReview[];
  createdAt: string;
  updatedAt: string;

}

/** 🔥 EXACT backend response */
export interface PublicProductsResponse {
  products: Product[];
  total: number;
  page: number;
  perpage: number;
  totalPages: number;
}

export interface PublicProductsApiResponse {
  data: PublicProductsResponse;
}


export type ProductReview = {
  _id?: string;
  rating?: number;
  comment?: string;
  userId?: string;
  createdAt?: string;
};

export type ProductByIdResponse = {
  data: Product;
};
