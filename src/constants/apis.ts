export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const EXTERNAL_API_BASE_URL = process.env.API_URL;


export const REGISTER_URL = API_BASE_URL + "/auth/register";
// export const LOGIN_URL = API_BASE_URL + "/auth/login"; // verify otp

export const LOGOUT_URL = API_BASE_URL + "/auth/logout";
export const REFRESH_TOKEN_URL = API_BASE_URL + "/auth/refresh";
export const SEND_OTP_URL = API_BASE_URL + "/auth/send-otp";
export const VERIFY_OTP_URL = API_BASE_URL + "/auth/verify-otp";
export const USER_PROFILE_URL = API_BASE_URL + "/auth/me";

export const DASHBOARD_URL = API_BASE_URL + "/dashboard"

export const PRODUCTS_URL = API_BASE_URL + "/products";
export const CATEGORIES_URL = API_BASE_URL + "/categories";
export const ORDERS_URL = API_BASE_URL + "/orders";
export const CART_URL = API_BASE_URL + "/cart";
export const WISHLIST_URL = API_BASE_URL + "/wishlist";


// External APIs (for server-side use)


export const EX_REGISTER_URL = EXTERNAL_API_BASE_URL + "/auth/signup";
export const EX_SEND_OTP_URL = EXTERNAL_API_BASE_URL + "/auth/send-otp";
export const EX_LOGIN_URL = EXTERNAL_API_BASE_URL + "/auth/login";
export const EX_LOGOUT_URL = EXTERNAL_API_BASE_URL + "/auth/logout";
export const EX_REFRESH_TOKEN_URL = EXTERNAL_API_BASE_URL + "/auth/refresh-token";
export const EX_VERIFY_OTP_URL = EXTERNAL_API_BASE_URL + "/auth/verify-otp";
export const EX_USER_PROFILE_URL = EXTERNAL_API_BASE_URL + "/auth/me";

export const EX_PRODUCTS_URL = EXTERNAL_API_BASE_URL + "/products";
export const EX_CATEGORIES_URL = EXTERNAL_API_BASE_URL + "/categories";
export const EX_ORDERS_URL = EXTERNAL_API_BASE_URL + "/orders";
export const EX_CART_URL = EXTERNAL_API_BASE_URL + "/cart";
export const EX_WISHLIST_URL = EXTERNAL_API_BASE_URL + "/wishlist";

export const EX_PAYMENT_INTENT_URL = EXTERNAL_API_BASE_URL + "/payments/intent";
