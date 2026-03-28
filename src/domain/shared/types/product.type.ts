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

/** Mega menu — shared with backend DTOs (see BE mega-menu API doc). */
export type MenuSubcategory = {
  id: string;
  name: string;
  href?: string;
  slug?: string;
  showSlug?: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  href?: string;
  fromCatalog?: boolean;
  image?: string;
  subcategories?: MenuSubcategory[];
};

export type MenuGroup = {
  id: string;
  name: string;
  href?: string;
  storefrontPath?: string;
  categories?: MenuCategory[];
};

/** Full menu document (GET responses, PATCH body when replacing groups). */
export type MegaMenuDocument = {
  id?: string;
  name: string;
  position: string;
  isDefault: boolean;
  version: number;
  savedAt: string;
  groups: MenuGroup[];
};

/** Admin list row — `id` always present from API. */
export type MegaMenuListItem = {
  id: string;
  name: string;
  position: string;
  isDefault: boolean;
};

/** POST body: required name, version, groups; optional position, isDefault, savedAt. */
export type CreateMegaMenuBody = {
  name: string;
  version: number;
  groups: MenuGroup[];
  position?: string;
  isDefault?: boolean;
  savedAt?: string;
};

export type UpdateMegaMenuBody = Partial<
  Pick<
    MegaMenuDocument,
    "name" | "position" | "isDefault" | "version" | "savedAt" | "groups"
  >
>;

/** @deprecated Prefer MenuSubcategory */
export type MegaMenuSubcategory = MenuSubcategory;
/** @deprecated Prefer MenuCategory */
export type MegaMenuCategory = MenuCategory;
/** @deprecated Prefer MenuGroup */
export type MegaMenuGroup = MenuGroup;

/** Where this menu is rendered: header row vs site footer */
export type MegaMenuPlacement = "top" | "footer";

/**
 * Legacy aggregate type for admin editor / payloads.
 * Prefer MegaMenuDocument for full reads; CreateMegaMenuBody / UpdateMegaMenuBody for writes.
 */
export type MegaMenuPayload = Partial<
  Pick<MegaMenuDocument, "name" | "position" | "isDefault" | "version" | "savedAt">
> & {
  /** Backend may omit on empty shell; editor always sends groups array. */
  groups?: MenuGroup[];
};

/** Envelope when backend wraps the menu in `data` */
export interface MegaMenuApiResponse {
  data: MegaMenuDocument;
}