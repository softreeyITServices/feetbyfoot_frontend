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
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DashboardService } from "@/domain/application/services/admin/dashboard.service";
import type {
  AdminDashboardOverviewResponse,
  DashboardTrend,
} from "@/domain/shared/types/admin/dashboard";
import { isGetRequestError } from "@/lib/httpClientError";

// ─── Types ────────────────────────────────────────────────────────────────

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
}

const COLORS: string[] = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const formatNumber = (value: number) => value.toLocaleString();

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendVal,
  accent,
}: StatCardProps) {
  const isUp = trend === "up";
  const isSame = trend === "same";

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col gap-4 hover:shadow-md hover:shadow-neutral-100 transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}
        >
          <Icon size={16} className="text-white" />
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
        <span>{trendVal} vs last month</span>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

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
      <p className="font-semibold text-neutral-700 mb-1">
        {safeLabel}
      </p>

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

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [overview, setOverview] = useState<
    AdminDashboardOverviewResponse | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await DashboardService.getOverview();
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
  }, []);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    void loadOverview();
  }, [initialized, loadOverview]);

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

  const formatTrendVal = (
    changePercent: number,
    trend: DashboardTrend
  ): string => {
    const safeVal = Number.isFinite(changePercent) ? changePercent : 0;

    if (trend === "same") return `${safeVal.toFixed(2)}%`;

    return `${safeVal >= 0 ? "+" : ""}${safeVal.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          {loading
            ? "Loading dashboard..."
            : "Welcome back — here's what's happening today."}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatNumber(summary?.totalRevenue.current ?? 0)}
          sub={`Previous: ${formatNumber(summary?.totalRevenue.previous ?? 0)}`}
          icon={IndianRupee}
          trend={summary?.totalRevenue.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.totalRevenue.changePercent ?? 0,
            summary?.totalRevenue.trend ?? "same"
          )}
          accent="bg-amber-500"
        />
        <StatCard
          label="Base Revenue"
          value={formatNumber(summary?.baseRevenue.current ?? 0)}
          sub={`Excl. Tax | Prev: ${formatNumber(summary?.baseRevenue.previous ?? 0)}`}
          icon={IndianRupee}
          trend={summary?.baseRevenue.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.baseRevenue.changePercent ?? 0,
            summary?.baseRevenue.trend ?? "same"
          )}
          accent="bg-emerald-600"
        />
        <StatCard
          label="GST Collected"
          value={formatNumber(summary?.gstAmount.current ?? 0)}
          sub={`Total Tax | Prev: ${formatNumber(summary?.gstAmount.previous ?? 0)}`}
          icon={IndianRupee}
          trend={summary?.gstAmount.trend ?? "same"}
          trendVal={formatTrendVal(
            summary?.gstAmount.changePercent ?? 0,
            summary?.gstAmount.trend ?? "same"
          )}
          accent="bg-blue-600"
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
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-800">Revenue & Orders</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />Revenue</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
              <Tooltip content={CustomTooltip} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#gradRevenue)" dot={false} />
              <Area type="monotone" dataKey="orders" name="Orders" stroke="#60a5fa" strokeWidth={2} fill="url(#gradOrders)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-neutral-800">Sales by Category</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Distribution this month</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                dataKey="value" paddingAngle={3}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {categoryData.map((c, i) => (
              <div key={`${c.name}-${i}`} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-neutral-600">{c.name}</span>
                </div>
                <span className="font-semibold text-neutral-800">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
         <div className="xl:col-span-3 bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-800">Top Products by Sales</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Units sold over last 6 months</p>
            </div>
          </div>
          {topProducts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-neutral-400">
              No product sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(280, topProducts.length * 42)}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(val: string) => (val && val.length > 24 ? `${val.slice(0, 24)}…` : val)}
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
                <Bar dataKey="sales" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
