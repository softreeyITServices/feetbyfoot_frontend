export interface AdminCategory {
  _id: string;
  name: string;
  isActive: boolean;
  image?: {
    url: string;
    publicId: string;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface AdminCategoryResponse<T> {
  message: string;
  data: T;
}

export interface CategoryPayload {
  name: string;
  categoryId?: string; // for subcategory
  isActive?: boolean;
  image?: {
    url: string;
    publicId: string;
  };
}

export interface CategoryResponse<T> {
  message: string;
  data: T;
}
export interface AdminCategoryType {
  _id: string;
  name: string;
  categoryId: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  isActive: boolean;
  image?: {
    url: string;
    publicId: string;
  };
  createdAt?: string;
  subcategoryCount: number;
  subcategories?: string;
  action?: React.ReactNode;
}