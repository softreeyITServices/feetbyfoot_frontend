export type DashboardTrend = "up" | "down" | "same";

export interface DashboardMetric {
  current: number;
  previous: number;
  changePercent: number;
  trend: DashboardTrend;
}

export interface AdminDashboardSummary {
  totalRevenue: DashboardMetric;
  totalOrders: DashboardMetric;
  newCustomers: DashboardMetric;
  productsListed: DashboardMetric;
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

export interface AdminDashboardCharts {
  revenueVsOrders: RevenueVsOrdersPoint[];
  salesByCategory: SalesByCategoryPoint[];
  topProductsBySales: TopProductBySalesPoint[];
}

export interface AdminDashboardOverviewResponse {
  summary: AdminDashboardSummary;
  charts: AdminDashboardCharts;
}
