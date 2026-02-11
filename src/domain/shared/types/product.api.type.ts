export interface ProductSize {
  size: string;
  quantity: number;
  isActive: boolean;
}

export interface ProductApi {
  _id: string;
  name: string;
  description: string;
  slug: string;
  brand: string;
  color: string;
  sizes: ProductSize[];
  price: number;
  salePrice: number;
  currency: "INR";
  imageUrls: string[];
  gender: string[];
  tags: string[];
  isActive: boolean;
  length: string;
  isFeatured: boolean;
  ratingAverage: number;
  totalRatings: number;
  createdAt: string;
}

export interface PublicProductsApiResponse {
  products: ProductApi[];
  total: number;
  page: number;
  perpage: number;
}
