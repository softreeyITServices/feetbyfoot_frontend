export interface WishlistApiProduct {
  _id: string;
  name: string;
  description: string;
  slug: string;
  brand: string;
  color: string;
  sizes: {
    _id: string;
    size: string;
    quantity: number;
    isActive: boolean;
  }[];
  price: number;
  salePrice: number;
  currency: string;
  imageUrls: string[];
  tags: string[];
  isActive: boolean;
}

export interface WishlistResponse {
  message: string;
  data: {
    products: WishlistApiProduct[]
  };
}

export interface AddToWishlistRequest {
  productId: string;
}
