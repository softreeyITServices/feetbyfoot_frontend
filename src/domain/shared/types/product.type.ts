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
  colors?: string[];
  sizes: ProductSize[];
  price: number;
  salePrice: number;
  currency: string;
  imageUrls: string[];
  categoryId: string;
  categoryTypeId: string;
  categoryTypeIds?: string[];
  gender: string[];
  tags: string[];
  isActive: boolean;
  length: string;
  isFeatured: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isGiftPack?: boolean;
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

export interface FilterCategory {
  _id: string;
  name: string;
}

export interface FilterSubcategory {
  _id: string;
  name: string;
  categoryId: string;
}

export interface PackType {
  label: string;
  value: boolean;
}

export interface DiscountBracket {
  label: string;
  minDiscount: number;
}

export interface ProductFilterMeta {
  genders: string[];
  categories: FilterCategory[];
  subcategories: FilterSubcategory[];
  sizes: string[];
  colors: string[];
  packTypes: PackType[];

}

export interface ProductFilterResponse {
  data: ProductFilterMeta;
  success: boolean;
  timestamp: string;
}


export type ProductByIdResponse = {
  data: ProductByIdData[];
};

export type ProductByIdData = {
  product: Product;
  categoriesProducts: Product[];
};

type ProductExcludedFields =
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "ratingAverage"
  | "totalRatings"
  | "reviews"
  | "isInWishlist";

export type CreateProductPayload = Omit<Product, ProductExcludedFields>;

/**
 * UPDATE payload (PATCH → partial)
 */
export type UpdateProductPayload = Partial<CreateProductPayload>;