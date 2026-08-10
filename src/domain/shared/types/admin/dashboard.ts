export type DashboardTrend = "up" | "down" | "same";

export interface DashboardMetric {
  current: number;
  previous: number;
  changePercent: number;
  trend: DashboardTrend;
}

export interface AdminDashboardSummary {
  totalRevenue: DashboardMetric;
  baseRevenue: DashboardMetric;
  gstAmount: DashboardMetric;
  totalOrders: DashboardMetric;
  newCustomers: DashboardMetric;
  productsListed: DashboardMetric;
  totalRefundedCod?: DashboardMetric;
  totalRefundedOnline?: DashboardMetric;
  totalCancelledOrders?: DashboardMetric;
}

export interface RevenueVsOrdersPoint {
  monthKey: string;
  monthLabel: string;
  revenue: number;
  orders: number;
}

export interface SalesByCategoryPoint {
  categoryId: string;
  categoryName: string;
  totalSalesAmount: number;
  totalUnitsSold: number;
  percentage: number;
}

export interface TopProductBySalesPoint {
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  totalUnitsSold: number;
  totalSalesAmount: number;
}

export interface ProductDetailedItem {
  productId: string;
  title: string;
  sku?: string;
  variantSkus?: string[];
  categoryName: string;
  subcategoryName?: string;
  price: number;
  salePrice?: number;
  gstRate?: number;
  mrp: number;
  stock: number;
  totalUnitsSold: number;
  totalSalesAmount: number;
  isFeatured: boolean;
}

export interface OrderDetailedItem {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  grossBaseRevenue?: number;
  grossGstAmount?: number;
  shippingCost: number;
  platformFee: number;
  discountAmount: number;
  totalAmount: number;
  totalRefunded: number;
  netRevenue: number;
  netBaseRevenue?: number;
  netGstAmount?: number;
  baseRevenue?: number;
  gstAmount?: number;
}

export interface CustomerDetailedItem {
  customerId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  registeredAt: string;
}

export interface AdminDashboardCharts {
  revenueVsOrders: RevenueVsOrdersPoint[];
  salesByCategory: SalesByCategoryPoint[];
  topProductsBySales: TopProductBySalesPoint[];
  productsList?: ProductDetailedItem[];
  ordersList?: OrderDetailedItem[];
  newCustomersList?: CustomerDetailedItem[];
}

export interface AdminDashboardOverviewResponse {
  summary: AdminDashboardSummary;
  charts: AdminDashboardCharts;
}
