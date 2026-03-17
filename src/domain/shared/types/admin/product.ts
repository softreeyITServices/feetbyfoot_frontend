export interface GetProductsQuery {
    categoryIds?: string | string[];
    categoryTypeIds?: string | string[];
    gender?: string[];
    sizes?: string[];
    brands?: string[];
    colors?: string[];
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    includeInactive?: boolean;
    isNewArrival?: boolean;
    isBestseller?: boolean;
    isGiftPack?: boolean;
  
    page?: number;
    limit?: number;
  
    sortBy?:
      | "default"
      | "price_low_high"
      | "price_high_low"
      | "discount"
      | "rating";
  }
  
  export interface ProductListResponse<T = any> {
    products: T[];
    total: number;
    page: number;
    perpage: number;
    totalPages: number;
  }