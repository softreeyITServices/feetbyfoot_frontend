export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

export interface WishlistResponse {
  message: string;
  products: WishlistProduct[];
}

export interface AddToWishlistRequest {
  productId: string;
}
