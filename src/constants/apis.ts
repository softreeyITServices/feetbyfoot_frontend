const isBrowser = typeof window !== "undefined";

// Use same-origin API in browser so auth cookies/session stay on the active host.
export const API_BASE_URL = isBrowser
  ? "/api"
  : process.env.NEXT_PUBLIC_API_URL || "/api";
const EXTERNAL_API_BASE_URL = process.env.API_URL;


export const REGISTER_URL = API_BASE_URL + "/auth/register";
// export const LOGIN_URL = API_BASE_URL + "/auth/login"; // verify otp

export const LOGOUT_URL = API_BASE_URL + "/auth/logout";
export const REFRESH_TOKEN_URL = API_BASE_URL + "/auth/refresh";
export const SEND_OTP_URL = API_BASE_URL + "/auth/send-otp";
export const VERIFY_OTP_URL = API_BASE_URL + "/auth/verify-otp";
export const USER_PROFILE_URL = API_BASE_URL + "/auth/me";
export const UPDATE_PROFILE_URL = API_BASE_URL + "/auth/profile";


export const DASHBOARD_URL = API_BASE_URL + "/dashboard"

export const PRODUCTS_URL = API_BASE_URL + "/products";
/** Admin product list → proxies to `GET .../products/admin/list` on backend */
export const PRODUCTS_ADMIN_LIST_URL = API_BASE_URL + "/products/admin/list";
/** Storefront default mega menu → proxies to `GET .../products/public/mega-menu` */
export const PRODUCTS_PUBLIC_MEGA_MENU_URL =
  API_BASE_URL + "/products/public/mega-menu";

export function productsPublicMegaMenuByIdUrl(menuId: string): string {
  return `${API_BASE_URL}/products/public/mega-menu/${menuId}`;
}

/** Admin menus CRUD → proxies to backend `/products/menus` */
export const PRODUCTS_MENUS_URL = API_BASE_URL + "/products/menus";

export function productsMenuByIdUrl(menuId: string): string {
  return `${API_BASE_URL}/products/menus/${menuId}`;
}
export const CATEGORIES_URL = API_BASE_URL + "/categories";
/** Admin categories list → proxies to backend `/categories/admin` */
export const ADMIN_CATEGORIES_URL = API_BASE_URL + "/categories/admin";

export const SUB_CATEGORIES_URL = API_BASE_URL + "/categories/subcategories";
/** Admin category types list → proxies to backend `/categoriestype/admin` */
export const ADMIN_SUB_CATEGORIES_URL = API_BASE_URL + "/categoriestype/admin";
export const ORDERS_URL = API_BASE_URL + "/payments/create-order";
export const CART_URL = API_BASE_URL + "/cart";
export const WISHLIST_URL = API_BASE_URL + "/wishlist";
export const PAYMENT_VERIFY = API_BASE_URL + "/payments/verify"
export const ADDRESS_URL = API_BASE_URL + "/address";
export const PLATFORM_FEES_URL = API_BASE_URL + "/platform-fees";

export const ALL_ORDERS_URL = API_BASE_URL + "/orders";

/** Customer invoice PDF → proxies to GET .../Orders/customer/download/:id (Mongo _id) */
export function orderCustomerDownloadPdfUrl(orderMongoId: string): string {
  return `${API_BASE_URL}/orders/customer/download/${encodeURIComponent(orderMongoId)}`;
}

/** Admin bulk confirmed+paid report → proxies to GET .../Orders/admin/download-orders-pdf */
export const ORDER_ADMIN_DOWNLOAD_PDF_URL =
  API_BASE_URL + "/orders/admin/download-orders-pdf";

/**
 * Admin single-order invoice PDF (Mongo _id).
 * Proxies to GET .../Orders/admin/download-order-pdf/:id — must exist on Nest and must NOT
 * scope by buyer userId (unlike the customer route, which only returns the current user’s orders).
 */
export function orderAdminSingleDownloadPdfUrl(orderMongoId: string): string {
  return `${API_BASE_URL}/orders/admin/download-order-pdf/${encodeURIComponent(orderMongoId)}`;
}

export const EXCHANGE_URL = API_BASE_URL + "/orders/exchange";
export const RETURN_URL = API_BASE_URL + "/orders/return";
export const CANCEL_UPDATE_ORDER_URL = API_BASE_URL + "/orders";
export const CONTACT_URL = API_BASE_URL + "/contact";
export const BANNERS_URL = API_BASE_URL + "/banners";
export const COUPONS_URL = API_BASE_URL + "/coupons";
export const RATING_URL = API_BASE_URL + "/rating";

// Admin APIs
export const ADMIN_ORDERS_URL = API_BASE_URL + "/orders/admin";
export const ADMIN_EXCHANGE_URL = API_BASE_URL + "/orders/admin/exchange";
export const ADMIN_RETURN_URL = API_BASE_URL + "/orders/admin/return";
export const ADMIN_ORDER_STATUS_URL = API_BASE_URL + "/orders/admin/status";
/** Admin COD payment status → proxies to `PATCH .../Orders/cod-payment-status` */
export const ADMIN_ORDER_COD_PAYMENT_STATUS_URL =
  API_BASE_URL + "/orders/admin/cod-payment-status";
export const ADMIN_EXCHANGES_URL = API_BASE_URL + "/orders/admin/exchanges";
export const ADMIN_UPLOAD_URL = API_BASE_URL + "/upload";
export const BLOG_COMMENTS_URL = API_BASE_URL + "/blog-comments";
export const ADMIN_CUSTOMERS_URL = API_BASE_URL + "/admin/customers";
export const ADMIN_DASHBOARD_OVERVIEW_URL =
  API_BASE_URL + "/admin/dashboard/overview";
// constants/apis.ts

export const BLOGS_URL = API_BASE_URL + "/admin/blogs";
export const BLOGS_URL_USER = API_BASE_URL + "/blogs";

export const ADMIN_BLOG_COMMENTS_URL = API_BASE_URL + "/blogs-comments";
export const CMS_URL = API_BASE_URL + "/cms";
export const SECTION_BANNERS_URL = API_BASE_URL + "/section-banners";

/** Storefront active announcements (home marquee) */
export const ANNOUNCEMENTS_PUBLIC_URL = API_BASE_URL + "/announcements/public";
/** Admin announcements CRUD → proxies to backend `/announcements/admin` */
export const ANNOUNCEMENTS_ADMIN_URL = API_BASE_URL + "/announcements/admin";

export function announcementsAdminByIdUrl(id: string): string {
  return `${API_BASE_URL}/announcements/admin/${encodeURIComponent(id)}`;
}

// External APIs (for server-side use)


export const EX_REGISTER_URL = EXTERNAL_API_BASE_URL + "/auth/signup";
export const EX_SEND_OTP_URL = EXTERNAL_API_BASE_URL + "/auth/send-otp";
export const EX_LOGIN_URL = EXTERNAL_API_BASE_URL + "/auth/login";
export const EX_LOGOUT_URL = EXTERNAL_API_BASE_URL + "/auth/logout";
export const EX_REFRESH_TOKEN_URL = EXTERNAL_API_BASE_URL + "/auth/refresh-token";
export const EX_VERIFY_OTP_URL = EXTERNAL_API_BASE_URL + "/auth/verify-otp";
export const EX_USER_PROFILE_URL = EXTERNAL_API_BASE_URL + "/auth/me";

export const EX_PRODUCTS_URL = EXTERNAL_API_BASE_URL + "/products";
/** Backend storefront mega menu (default). */
export const EX_PRODUCTS_PUBLIC_MEGA_MENU_URL =
  EXTERNAL_API_BASE_URL + "/products/public/mega-menu";

export function exProductsPublicMegaMenuByIdUrl(menuId: string): string {
  return `${EXTERNAL_API_BASE_URL}/products/public/mega-menu/${menuId}`;
}

/** Backend admin menus: list, create, get by id, patch by id. */
export const EX_PRODUCTS_MENUS_URL = EXTERNAL_API_BASE_URL + "/products/menus";

export function exProductsMenuByIdUrl(menuId: string): string {
  return `${EXTERNAL_API_BASE_URL}/products/menus/${menuId}`;
}
/** Public / storefront categories (active only). */
export const EX_CATEGORIES_URL = EXTERNAL_API_BASE_URL + "/categories";
/** Admin categories (`GET /categories/admin`). */
export const EX_ADMIN_CATEGORIES_URL =
  EXTERNAL_API_BASE_URL + "/categories/admin";

/** Public / storefront category types (active only). */
export const EX_SUB_CATEGORIES_URL = EXTERNAL_API_BASE_URL + "/categoriestype";
/** Admin category types (`GET /categoriestype/admin`). */
export const EX_ADMIN_SUB_CATEGORIES_URL =
  EXTERNAL_API_BASE_URL + "/categoriestype/admin";
export const EX_ORDERS_URL = EXTERNAL_API_BASE_URL + "/payments/create-order";
export const EX_CART_URL = EXTERNAL_API_BASE_URL + "/cart";
export const EX_WISHLIST_URL = EXTERNAL_API_BASE_URL + "/wishlist";

export const EX_PAYMENT_VERIFY = EXTERNAL_API_BASE_URL + "/payments/verify";
export const EX_ADDRESS_URL = EXTERNAL_API_BASE_URL + "/address";
export const EX_PLATFORM_FEES_URL = EXTERNAL_API_BASE_URL + "/platform-fees";
export const EX_ALL_ORDERS_URL = EXTERNAL_API_BASE_URL + "/orders";

function exApiV1Base(): string {
  return (EXTERNAL_API_BASE_URL ?? "").replace(/\/$/, "");
}

/** Backend GET /Orders/customer/download/:id */
export function exOrderCustomerDownloadPdfUrl(orderMongoId: string): string {
  return `${exApiV1Base()}/Orders/customer/download/${encodeURIComponent(orderMongoId)}`;
}

/** Backend GET /Orders/admin/download-orders-pdf */
export function exOrderAdminDownloadPdfUrl(): string {
  return `${exApiV1Base()}/Orders/admin/download-orders-pdf`;
}

/** Backend GET /Orders/admin/download-order-pdf/:id (single invoice; admin role) */
export function exOrderAdminSingleDownloadPdfUrl(orderMongoId: string): string {
  return `${exApiV1Base()}/Orders/admin/download-order-pdf/${encodeURIComponent(orderMongoId)}`;
}

export const EX_EXCHANGE_URL = EXTERNAL_API_BASE_URL + "/user/order/exchange";
export const EX_RETURN_URL = EXTERNAL_API_BASE_URL + "/user/order/return";
export const EX_CANCEL_UPDATE_ORDER_URL = EXTERNAL_API_BASE_URL + "/user/orders";
export const EX_UPDATE_PROFILE_URL = EXTERNAL_API_BASE_URL + "/auth/profile";
export const EX_CONTACT_URL = EXTERNAL_API_BASE_URL + "/contact";
export const EX_BANNERS_URL = EXTERNAL_API_BASE_URL + "/banners";
export const EX_COUPONS_URL = EXTERNAL_API_BASE_URL + "/coupons";
export const EX_RATING_URL = EXTERNAL_API_BASE_URL + "/rating";


// External Admin APIs
export const EX_ADMIN_EXCHANGE_URL = EXTERNAL_API_BASE_URL + "/admin/exchanges";
export const EX_ADMIN_RETURN_URL = EXTERNAL_API_BASE_URL + "/admin/order/return";
export const EX_ADMIN_ORDER_STATUS_URL = EXTERNAL_API_BASE_URL + "/admin/order/status";
export const EX_ADMIN_ORDER_COD_PAYMENT_STATUS_URL =
  EXTERNAL_API_BASE_URL + "/Orders/cod-payment-status";
export const EX_UPLOAD_URL = EXTERNAL_API_BASE_URL + "/upload";
/** Public blog API (list / read published content). */
export const EX_BLOGS_URL = EXTERNAL_API_BASE_URL + "/blogs";
/** Admin blog API (CRUD / drafts). */
export const EX_ADMIN_BLOGS_URL = EXTERNAL_API_BASE_URL + "/admin/blogs";
export const EX_BLOG_COMMENTS_URL = EXTERNAL_API_BASE_URL + "/blog-comments";
export const EX_ADMIN_BLOG_COMMENTS_URL = EXTERNAL_API_BASE_URL + "/admin/blog-comments";
export const EX_ADMIN_CUSTOMERS_URL = EXTERNAL_API_BASE_URL + "/admin/customers";
export const EX_ADMIN_DASHBOARD_OVERVIEW_URL =
  EXTERNAL_API_BASE_URL + "/admin/dashboard/overview";
export const EX_CMS_URL = EXTERNAL_API_BASE_URL + "/cms";
export const EX_SECTION_BANNERS_URL = EXTERNAL_API_BASE_URL + "/section-banners";
export const EX_ANNOUNCEMENTS_PUBLIC_URL =
  EXTERNAL_API_BASE_URL + "/announcements/public";
export const EX_ANNOUNCEMENTS_ADMIN_URL =
  EXTERNAL_API_BASE_URL + "/announcements/admin";

export function exAnnouncementsAdminByIdUrl(id: string): string {
  return `${EXTERNAL_API_BASE_URL}/announcements/admin/${encodeURIComponent(id)}`;
}
