"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import {
  ShoppingBag,
  Users,
  Package,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CreditCard,
  XCircle,
  Download,
  Calendar,
  Search,
  FileSpreadsheet,
  FileText,
  FileType,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DashboardService } from "@/domain/application/services/admin/dashboard.service";
import type {
  AdminDashboardOverviewResponse,
  DashboardTrend,
  ProductDetailedItem,
} from "@/domain/shared/types/admin/dashboard";
import { isGetRequestError } from "@/lib/httpClientError";
import { exportToExcel, exportToCSV, exportToPDF } from "@/lib/exportUtils";

// ─── Types & Constants ────────────────────────────────────────────────────────

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface ProductData {
  name: string;
  sales: number;
  revenue: number;
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  trend: DashboardTrend;
  trendVal: string;
  accent: string;
  onExport: (format: "excel" | "csv" | "pdf") => void;
}

const COLORS: string[] = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const formatNumber = (value: number) => value.toLocaleString();

// ─── Stat Card Component with Individual Export Dropdown ───────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendVal,
  accent,
  onExport,
}: StatCardProps) {
  const isUp = trend === "up";
  const isSame = trend === "same";
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col gap-4 hover:shadow-md hover:shadow-neutral-100 transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {label}
        </span>

        <div className="flex items-center gap-2">
          {/* Individual Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              title={`Download ${label} report`}
            >
              <Download size={15} />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 text-xs text-neutral-700 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExport("excel");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 text-left transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet size={13} className="text-emerald-600" />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExport("csv");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 text-left transition-colors cursor-pointer"
                  >
                    <FileType size={13} className="text-blue-600" />
                    <span>CSV (.csv)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExport("pdf");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 text-left transition-colors cursor-pointer"
                  >
                    <FileText size={13} className="text-rose-600" />
                    <span>PDF (.pdf)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}
          >
            <Icon size={16} className="text-white" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-neutral-900 tracking-tight">
          {value}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
      </div>

      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${
          isSame
            ? "text-neutral-500"
            : isUp
              ? "text-emerald-600"
              : "text-red-500"
        }`}
      >
        {!isSame &&
          (isUp ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          ))}
        <span>{trendVal} vs previous period</span>
      </div>
    </div>
  );
}

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipContentProps<any, any>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const safeLabel = typeof label === "string" ? label : "";

  return (
    <div className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-neutral-700 mb-1">{safeLabel}</p>

      {payload.map((entry, index) => {
        if (typeof entry.value !== "number") return null;
        if (typeof entry.dataKey !== "string") return null;

        const formattedValue = formatNumber(entry.value);

        return (
          <p
            key={`${entry.dataKey}-${index}`}
            style={{ color: entry.color ?? "#000" }}
            className="font-medium"
          >
            {entry.name}: {formattedValue}
          </p>
        );
      })}
    </div>
  );
};

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function AdminDashboard() {
  const [overview, setOverview] = useState<
    AdminDashboardOverviewResponse | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Date Filter State
  const [preset, setPreset] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Product List Table Search & Pagination
  const [productSearch, setProductSearch] = useState("");
  const [showProductExportMenu, setShowProductExportMenu] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 10;

  // Helper to format Date to YYYY-MM-DD
  const formatDateToInput = (d: Date) => d.toISOString().split("T")[0];

  const loadOverview = useCallback(
    async (start?: string, end?: string) => {
      try {
        setLoading(true);
        const res = await DashboardService.getOverview(start, end);
        setOverview(res);
      } catch (error: unknown) {
        if (!isGetRequestError(error)) {
          toast.error(
            (error as { message?: string })?.message ||
              "Failed to load dashboard overview"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update preset dates and auto-apply
  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    const now = new Date();
    let sStr = startDate;
    let eStr = endDate;

    if (newPreset === "today") {
      const todayStr = formatDateToInput(now);
      sStr = todayStr;
      eStr = todayStr;
    } else if (newPreset === "yesterday") {
      const yest = new Date();
      yest.setDate(now.getDate() - 1);
      const yestStr = formatDateToInput(yest);
      sStr = yestStr;
      eStr = yestStr;
    } else if (newPreset === "last_7_days") {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      sStr = formatDateToInput(start);
      eStr = formatDateToInput(now);
    } else if (newPreset === "last_30_days") {
      const start = new Date();
      start.setDate(now.getDate() - 29);
      sStr = formatDateToInput(start);
      eStr = formatDateToInput(now);
    } else if (newPreset === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      sStr = formatDateToInput(start);
      eStr = formatDateToInput(now);
    } else if (newPreset === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      sStr = formatDateToInput(start);
      eStr = formatDateToInput(end);
    }

    setStartDate(sStr);
    setEndDate(eStr);

    if (newPreset !== "custom") {
      void loadOverview(sStr, eStr);
    }
  };

  // Initialize dates on first load
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startStr = formatDateToInput(startOfMonth);
    const endStr = formatDateToInput(now);

    setStartDate(startStr);
    setEndDate(endStr);
    void loadOverview(startStr, endStr);
  }, [initialized, loadOverview]);

  // Apply custom or preset date filter
  const applyDateFilter = () => {
    void loadOverview(startDate, endDate);
  };

  const summary = overview?.summary;

  const revenueData: RevenueData[] =
    overview?.charts.revenueVsOrders.map((p) => ({
      month: p.monthLabel,
      revenue: p.revenue,
      orders: p.orders,
    })) ?? [];

  const categoryData: CategoryData[] =
    overview?.charts.salesByCategory.map((c) => ({
      name: c.categoryName,
      value: c.percentage,
    })) ?? [];

  const topProducts: ProductData[] =
    overview?.charts.topProductsBySales.map((p) => ({
      name: p.productName,
      sales: p.totalUnitsSold,
      revenue: p.totalSalesAmount,
    })) ?? [];

  const productsList: ProductDetailedItem[] =
    overview?.charts.productsList ?? [];

  const filteredProductsList = productsList.filter((p) => {
    const term = productSearch.toLowerCase().trim();
    if (!term) return true;

    return (
      p.title.toLowerCase().includes(term) ||
      p.categoryName.toLowerCase().includes(term) ||
      (p.subcategoryName && p.subcategoryName.toLowerCase().includes(term)) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.variantSkus && p.variantSkus.some((v) => v.toLowerCase().includes(term)))
    );
  });

  const totalProductPages = Math.ceil(filteredProductsList.length / productPageSize) || 1;
  const paginatedProductsList = filteredProductsList.slice(
    (productPage - 1) * productPageSize,
    productPage * productPageSize
  );

  useEffect(() => {
    setProductPage(1);
  }, [productSearch, overview]);

  const formatTrendVal = (
    changePercent: number,
    trend: DashboardTrend
  ): string => {
    const safeVal = Number.isFinite(changePercent) ? changePercent : 0;

    if (trend === "same") return `${safeVal.toFixed(2)}%`;

    return `${safeVal >= 0 ? "+" : ""}${safeVal.toFixed(2)}%`;
  };

  const getDateRangeLabel = () => {
    if (!startDate || !endDate) return "Current Period";
    return `${startDate} to ${endDate}`;
  };

  // Export handlers for individual StatCards with Itemized Breakdown
  const handleStatExport = (
    metricName: string,
    val: string,
    prevVal: string,
    changePercent: string,
    items: Record<string, any>[] | undefined,
    format: "excel" | "csv" | "pdf"
  ) => {
    const payload = {
      metricName,
      value: val,
      previousValue: prevVal,
      changePercent,
      dateRange: getDateRangeLabel(),
      items,
    };

    if (format === "excel") exportToExcel(payload);
    else if (format === "csv") exportToCSV(payload);
    else exportToPDF(payload);

    toast.success(`Exported ${metricName} to ${format.toUpperCase()}`);
  };

  // Export handler for Product List
  const handleProductListExport = (format: "excel" | "csv" | "pdf") => {
    const items = filteredProductsList.map((p) => ({
      "Product Title": p.title,
      SKU: p.sku || "N/A",
      Category: p.categoryName,
      Subcategory: p.subcategoryName || "N/A",
      "Actual Price (₹)": p.price,
      "Sale Price (₹)": p.salePrice || 0,
      "GST (%)": `${p.gstRate || 0}%`,
      "Stock Count": p.stock,
      "Units Sold": p.totalUnitsSold,
      "Total Revenue (₹)": p.totalSalesAmount,
    }));

    const payload = {
      metricName: "Product List Report",
      value: `${filteredProductsList.length} Products`,
      dateRange: getDateRangeLabel(),
      items,
    };

    if (format === "excel") exportToExcel(payload);
    else if (format === "csv") exportToCSV(payload);
    else exportToPDF(payload);

    toast.success(`Exported Product List to ${format.toUpperCase()}`);
  };

  const rawOrdersList = overview?.charts.ordersList ?? [];
  const rawCustomersList = overview?.charts.newCustomersList ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header & Date Range Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {loading
              ? "Fetching real-time statistics..."
              : `Showing performance metrics for ${getDateRangeLabel()}`}
          </p>
        </div>

        {/* Date Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs">
            <Calendar size={14} className="text-neutral-400" />
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-transparent border-none text-neutral-700 font-medium focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="this_month">This Month</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPreset("custom");
              }}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 focus:outline-none text-xs"
            />
            <span className="text-neutral-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPreset("custom");
              }}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 focus:outline-none text-xs"
            />
          </div>

          <button
            onClick={applyDateFilter}
            disabled={loading}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Stat Cards Grid with Itemized Download List for Each Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₹${formatNumber(summary?.totalRevenue.current ?? 0)}`}
          sub={`Previous: ₹${formatNumber(summary?.totalRevenue.previous ?? 0)}`}
          icon={IndianRupee}
          trend={summary?.totalRevenue.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.totalRevenue.changePercent ?? 0,
            summary?.totalRevenue.trend ?? "same"
          )}
          accent="bg-amber-500"
          onExport={(format) =>
            handleStatExport(
              "Total Revenue",
              `₹${formatNumber(summary?.totalRevenue.current ?? 0)}`,
              `₹${formatNumber(summary?.totalRevenue.previous ?? 0)}`,
              `${summary?.totalRevenue.changePercent ?? 0}%`,
              rawOrdersList
                .filter(
                  (o) =>
                    o.paymentStatus === "PAID" ||
                    o.paymentStatus === "REFUNDED" ||
                    o.paymentStatus === "PARTIALLY_REFUNDED"
                )
                .map((o) => ({
                  "Order Number": o.orderNumber,
                  Date: o.orderDate,
                  Customer: o.customerName,
                  "Payment Method": o.paymentMethod,
                  "Payment Status": o.paymentStatus,
                  "Order Status": o.orderStatus,
                  "Gross Base Revenue (₹)": o.grossBaseRevenue ?? o.baseRevenue ?? 0,
                  "Gross GST Amount (₹)": o.grossGstAmount ?? o.gstAmount ?? 0,
                  "Shipping Cost (₹)": o.shippingCost,
                  "Platform Fee (₹)": o.platformFee,
                  "Discount (₹)": o.discountAmount,
                  "Total Order Amount (₹)": o.totalAmount,
                  "Total Refunded (₹)": o.totalRefunded,
                  "Net Revenue (₹)": o.netRevenue,
                })),
              format
            )
          }
        />

        <StatCard
          label="Base Revenue"
          value={`₹${formatNumber(summary?.baseRevenue.current ?? 0)}`}
          sub={`Excl. Tax | Prev: ₹${formatNumber(summary?.baseRevenue.previous ?? 0)}`}
          icon={IndianRupee}
          trend={summary?.baseRevenue.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.baseRevenue.changePercent ?? 0,
            summary?.baseRevenue.trend ?? "same"
          )}
          accent="bg-emerald-600"
          onExport={(format) =>
            handleStatExport(
              "Base Revenue",
              `₹${formatNumber(summary?.baseRevenue.current ?? 0)}`,
              `₹${formatNumber(summary?.baseRevenue.previous ?? 0)}`,
              `${summary?.baseRevenue.changePercent ?? 0}%`,
              rawOrdersList
                .filter(
                  (o) =>
                    o.paymentStatus === "PAID" ||
                    o.paymentStatus === "REFUNDED" ||
                    o.paymentStatus === "PARTIALLY_REFUNDED"
                )
                .map((o) => ({
                  "Order Number": o.orderNumber,
                  Date: o.orderDate,
                  Customer: o.customerName,
                  "Payment Method": o.paymentMethod,
                  "Payment Status": o.paymentStatus,
                  "Order Status": o.orderStatus,
                  "Gross Base Revenue (₹)": o.grossBaseRevenue ?? o.baseRevenue ?? 0,
                  "Gross GST Amount (₹)": o.grossGstAmount ?? o.gstAmount ?? 0,
                  "Shipping Cost (₹)": o.shippingCost,
                  "Platform Fee (₹)": o.platformFee,
                  "Discount (₹)": o.discountAmount,
                  "Total Order Amount (₹)": o.totalAmount,
                  "Total Refunded (₹)": o.totalRefunded,
                  "Net Base Revenue (₹)": o.netBaseRevenue ?? o.baseRevenue ?? 0,
                })),
              format
            )
          }
        />

        <StatCard
          label="GST Collected"
          value={`₹${formatNumber(summary?.gstAmount.current ?? 0)}`}
          sub={`Total Tax | Prev: ₹${formatNumber(summary?.gstAmount.previous ?? 0)}`}
          icon={IndianRupee}
          trend={summary?.gstAmount.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.gstAmount.changePercent ?? 0,
            summary?.gstAmount.trend ?? "same"
          )}
          accent="bg-blue-600"
          onExport={(format) =>
            handleStatExport(
              "GST Collected",
              `₹${formatNumber(summary?.gstAmount.current ?? 0)}`,
              `₹${formatNumber(summary?.gstAmount.previous ?? 0)}`,
              `${summary?.gstAmount.changePercent ?? 0}%`,
              rawOrdersList
                .filter(
                  (o) =>
                    o.paymentStatus === "PAID" ||
                    o.paymentStatus === "REFUNDED" ||
                    o.paymentStatus === "PARTIALLY_REFUNDED"
                )
                .map((o) => ({
                  "Order Number": o.orderNumber,
                  Date: o.orderDate,
                  Customer: o.customerName,
                  "Payment Method": o.paymentMethod,
                  "Payment Status": o.paymentStatus,
                  "Order Status": o.orderStatus,
                  "Gross Base Revenue (₹)": o.grossBaseRevenue ?? o.baseRevenue ?? 0,
                  "Gross GST Amount (₹)": o.grossGstAmount ?? o.gstAmount ?? 0,
                  "Shipping Cost (₹)": o.shippingCost,
                  "Platform Fee (₹)": o.platformFee,
                  "Discount (₹)": o.discountAmount,
                  "Total Order Amount (₹)": o.totalAmount,
                  "Total Refunded (₹)": o.totalRefunded,
                  "Net GST Collected (₹)": o.netGstAmount ?? o.gstAmount ?? 0,
                })),
              format
            )
          }
        />

        <StatCard
          label="Total Orders"
          value={formatNumber(summary?.totalOrders.current ?? 0)}
          sub={`Previous: ${formatNumber(summary?.totalOrders.previous ?? 0)}`}
          icon={ShoppingBag}
          trend={summary?.totalOrders.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.totalOrders.changePercent ?? 0,
            summary?.totalOrders.trend ?? "same"
          )}
          accent="bg-blue-500"
          onExport={(format) =>
            handleStatExport(
              "Total Orders",
              formatNumber(summary?.totalOrders.current ?? 0),
              formatNumber(summary?.totalOrders.previous ?? 0),
              `${summary?.totalOrders.changePercent ?? 0}%`,
              rawOrdersList.map((o) => ({
                "Order Number": o.orderNumber,
                Date: o.orderDate,
                Customer: o.customerName,
                Email: o.customerEmail,
                Phone: o.customerPhone,
                "Payment Method": o.paymentMethod,
                "Payment Status": o.paymentStatus,
                "Order Status": o.orderStatus,
                "Total Amount (₹)": o.totalAmount,
              })),
              format
            )
          }
        />

        <StatCard
          label="New Customers"
          value={formatNumber(summary?.newCustomers.current ?? 0)}
          sub={`Previous: ${formatNumber(summary?.newCustomers.previous ?? 0)}`}
          icon={Users}
          trend={summary?.newCustomers.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.newCustomers.changePercent ?? 0,
            summary?.newCustomers.trend ?? "same"
          )}
          accent="bg-emerald-500"
          onExport={(format) =>
            handleStatExport(
              "New Customers",
              formatNumber(summary?.newCustomers.current ?? 0),
              formatNumber(summary?.newCustomers.previous ?? 0),
              `${summary?.newCustomers.changePercent ?? 0}%`,
              rawCustomersList.map((c) => ({
                "Customer ID": c.customerId,
                "Full Name": c.fullName,
                Email: c.email,
                "Mobile Number": c.mobileNumber,
                "Registered At": c.registeredAt,
              })),
              format
            )
          }
        />

        <StatCard
          label="Products Listed"
          value={formatNumber(summary?.productsListed.current ?? 0)}
          sub={`Previous: ${formatNumber(summary?.productsListed.previous ?? 0)}`}
          icon={Package}
          trend={summary?.productsListed.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.productsListed.changePercent ?? 0,
            summary?.productsListed.trend ?? "same"
          )}
          accent="bg-purple-500"
          onExport={(format) =>
            handleStatExport(
              "Products Listed",
              formatNumber(summary?.productsListed.current ?? 0),
              formatNumber(summary?.productsListed.previous ?? 0),
              `${summary?.productsListed.changePercent ?? 0}%`,
              productsList.map((p) => ({
                "Product Title": p.title,
                SKU: p.sku || "N/A",
                Category: p.categoryName,
                Subcategory: p.subcategoryName || "N/A",
                "Actual Price (₹)": p.price,
                "Sale Price (₹)": p.salePrice || 0,
                "GST (%)": `${p.gstRate || 0}%`,
                "Stock Count": p.stock,
                "Units Sold": p.totalUnitsSold,
                "Total Revenue (₹)": p.totalSalesAmount,
              })),
              format
            )
          }
        />

        <StatCard
          label="COD Refunded"
          value={`₹${formatNumber(summary?.totalRefundedCod?.current ?? 0)}`}
          sub={`Previous: ₹${formatNumber(summary?.totalRefundedCod?.previous ?? 0)}`}
          icon={RefreshCw}
          trend={summary?.totalRefundedCod?.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.totalRefundedCod?.changePercent ?? 0,
            summary?.totalRefundedCod?.trend ?? "same"
          )}
          accent="bg-orange-500"
          onExport={(format) =>
            handleStatExport(
              "COD Refunded",
              `₹${formatNumber(summary?.totalRefundedCod?.current ?? 0)}`,
              `₹${formatNumber(summary?.totalRefundedCod?.previous ?? 0)}`,
              `${summary?.totalRefundedCod?.changePercent ?? 0}%`,
              rawOrdersList
                .filter((o) => o.paymentMethod === "COD" && o.totalRefunded > 0)
                .map((o) => ({
                  "Order Number": o.orderNumber,
                  Date: o.orderDate,
                  Customer: o.customerName,
                  Email: o.customerEmail,
                  "Mobile Number": o.customerPhone,
                  "Refunded Amount (₹)": o.totalRefunded,
                })),
              format
            )
          }
        />

        <StatCard
          label="Online Refunded"
          value={`₹${formatNumber(summary?.totalRefundedOnline?.current ?? 0)}`}
          sub={`Previous: ₹${formatNumber(summary?.totalRefundedOnline?.previous ?? 0)}`}
          icon={CreditCard}
          trend={summary?.totalRefundedOnline?.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.totalRefundedOnline?.changePercent ?? 0,
            summary?.totalRefundedOnline?.trend ?? "same"
          )}
          accent="bg-teal-500"
          onExport={(format) =>
            handleStatExport(
              "Online Refunded",
              `₹${formatNumber(summary?.totalRefundedOnline?.current ?? 0)}`,
              `₹${formatNumber(summary?.totalRefundedOnline?.previous ?? 0)}`,
              `${summary?.totalRefundedOnline?.changePercent ?? 0}%`,
              rawOrdersList
                .filter((o) => o.paymentMethod !== "COD" && o.totalRefunded > 0)
                .map((o) => ({
                  "Order Number": o.orderNumber,
                  Date: o.orderDate,
                  Customer: o.customerName,
                  Email: o.customerEmail,
                  "Mobile Number": o.customerPhone,
                  "Payment Method": o.paymentMethod,
                  "Refunded Amount (₹)": o.totalRefunded,
                })),
              format
            )
          }
        />

        <StatCard
          label="Cancelled Orders"
          value={formatNumber(summary?.totalCancelledOrders?.current ?? 0)}
          sub={`Previous: ${formatNumber(summary?.totalCancelledOrders?.previous ?? 0)}`}
          icon={XCircle}
          trend={summary?.totalCancelledOrders?.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.totalCancelledOrders?.changePercent ?? 0,
            summary?.totalCancelledOrders?.trend ?? "same"
          )}
          accent="bg-rose-500"
          onExport={(format) =>
            handleStatExport(
              "Cancelled Orders",
              formatNumber(summary?.totalCancelledOrders?.current ?? 0),
              formatNumber(summary?.totalCancelledOrders?.previous ?? 0),
              `${summary?.totalCancelledOrders?.changePercent ?? 0}%`,
              rawOrdersList
                .filter(
                  (o) =>
                    o.orderStatus === "CANCELLED" ||
                    o.orderStatus === "PARTIALLY_CANCELLED"
                )
                .map((o) => ({
                  "Order Number": o.orderNumber,
                  Date: o.orderDate,
                  Customer: o.customerName,
                  Email: o.customerEmail,
                  "Mobile Number": o.customerPhone,
                  Status: o.orderStatus,
                  "Total Amount (₹)": o.totalAmount,
                })),
              format
            )
          }
        />
      </div>

      {/* Product List Table Section with Export Buttons */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-800">
              Product List Performance
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sales, units sold, and stock quantities within selected date range
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 w-48"
              />
            </div>

            {/* Product List Export Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setShowProductExportMenu(!showProductExportMenu)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>Export Product List</span>
              </button>

              {showProductExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProductExportMenu(false)}
                  />
                  <div className="absolute right-0 top-9 z-20 w-40 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 text-xs text-neutral-700 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowProductExportMenu(false);
                        handleProductListExport("excel");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 text-left transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>Download Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProductExportMenu(false);
                        handleProductListExport("csv");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 text-left transition-colors cursor-pointer"
                    >
                      <FileType size={14} className="text-blue-600" />
                      <span>Download CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProductExportMenu(false);
                        handleProductListExport("pdf");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 text-left transition-colors cursor-pointer"
                    >
                      <FileText size={14} className="text-rose-600" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product List Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-100">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-100">
              <tr>
                <th className="py-3 px-4">Product Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Subcategory</th>
                <th className="py-3 px-4">Actual Price</th>
                <th className="py-3 px-4">Sale Price</th>
                <th className="py-3 px-4">GST</th>
                <th className="py-3 px-4">Stock Count</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProductsList.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-neutral-400 font-medium"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProductsList.map((product) => (
                  <tr key={product.productId} className="hover:bg-neutral-50/60">
                    <td className="py-3 px-4 font-semibold text-neutral-800">
                      <div className="flex flex-col">
                        <span>{product.title}</span>
                        {product.sku && (
                          <span className="text-[10px] text-neutral-400 font-mono font-normal">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {product.categoryName}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {product.subcategoryName || "-"}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-700">
                      ₹{formatNumber(product.price)}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-700">
                      {product.salePrice && product.salePrice > 0 ? (
                        <span>₹{formatNumber(product.salePrice)}</span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 font-medium">
                      {product.gstRate ?? 0}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          product.stock > 10
                            ? "bg-emerald-50 text-emerald-700"
                            : product.stock > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {product.stock} left
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      {formatNumber(product.totalUnitsSold)}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-600">
                      ₹{formatNumber(product.totalSalesAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredProductsList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
            <div>
              Showing{" "}
              <span className="font-semibold text-neutral-700">
                {(productPage - 1) * productPageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-neutral-700">
                {Math.min(productPage * productPageSize, filteredProductsList.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-neutral-700">
                {filteredProductsList.length}
              </span>{" "}
              products
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setProductPage((p) => Math.max(p - 1, 1))}
                disabled={productPage === 1}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-medium">
                Page {productPage} of {totalProductPages}
              </span>

              <button
                onClick={() => setProductPage((p) => Math.min(p + 1, totalProductPages))}
                disabled={productPage >= totalProductPages}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-800">
                Revenue & Orders Trend
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Monthly trend analysis
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Revenue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                Orders
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={revenueData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#a3a3a3" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#a3a3a3" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={CustomTooltip} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gradRevenue)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#60a5fa"
                strokeWidth={2}
                fill="url(#gradOrders)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-neutral-800">
              Sales by Category
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Category distribution in range
            </p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {categoryData.map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-neutral-600">{c.name}</span>
                </div>
                <span className="font-semibold text-neutral-800">
                  {c.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-800">
                Top Products by Sales Volume
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Units sold in selected date range
              </p>
            </div>
          </div>
          {topProducts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-neutral-400">
              No product sales data available in selected date range
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(280, topProducts.length * 42)}
            >
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#a3a3a3" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(val: string) =>
                    val && val.length > 24 ? `${val.slice(0, 24)}…` : val
                  }
                  axisLine={false}
                  tickLine={false}
                  width={160}
                />
                <Tooltip
                  cursor={{ fill: "#fef9ec" }}
                  formatter={(v: any, _name: any, item: any) => [
                    `${formatNumber(Number(v))} units (₹${formatNumber(item?.payload?.revenue || 0)})`,
                    "Sales",
                  ]}
                />
                <Bar
                  dataKey="sales"
                  fill="#f59e0b"
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
