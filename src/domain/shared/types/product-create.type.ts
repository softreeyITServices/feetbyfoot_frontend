export interface ProductAttributes {
    size?: string[];
    color?: string[];
    [key: string]: unknown;
  }
  
  export interface ProductMeta {
    title?: string;
    keywords?: string[];
    description?: string;
  }
  
  export interface CreateProductDTO {
    name: string;
    slug?: string;
    description?: string;
    sku?: string;
  
    price: number;
    discountPrice?: number;
    currency: string;
    stock: number;
  
    categoryId: string;
    categoryTypeId: string;
    brandId?: string;
  
    images?: string[];
    thumbnail?: string;
  
    isActive?: boolean;
  
    attributes?: ProductAttributes;
    meta?: ProductMeta;
  }