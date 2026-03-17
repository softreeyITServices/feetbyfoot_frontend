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
} from "lucide-react";
import Link from "next/link";
import React from "react";

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
  trend: "up" | "down";
}

type OrderStatus =
  | "Delivered"
  | "Processing"
  | "Shipped"
  | "Pending"
  | "Cancelled";

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: OrderStatus;
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  trend: "up" | "down";
  trendVal: string;
  accent: string;
}

// ─── Sample Data ───────────────────────────────────────────────────────────

const revenueData: RevenueData[] = [
  { month: "Aug", revenue: 182000, orders: 340 },
  { month: "Sep", revenue: 210000, orders: 410 },
  { month: "Oct", revenue: 195000, orders: 375 },
  { month: "Nov", revenue: 278000, orders: 520 },
  { month: "Dec", revenue: 312000, orders: 610 },
  { month: "Jan", revenue: 265000, orders: 490 },
  { month: "Feb", revenue: 294000, orders: 545 },
];

const categoryData: CategoryData[] = [
  { name: "Running", value: 38 },
  { name: "Casual", value: 27 },
  { name: "Formal", value: 18 },
  { name: "Sports", value: 12 },
  { name: "Kids", value: 5 },
];

const topProducts: ProductData[] = [
  { name: "Nike Air Max 90", sales: 412, revenue: 2060000, trend: "up" },
  { name: "Adidas Ultraboost 23", sales: 378, revenue: 1890000, trend: "up" },
  { name: "Puma RS-X3", sales: 291, revenue: 1164000, trend: "down" },
  { name: "New Balance 574", sales: 264, revenue: 1056000, trend: "up" },
  { name: "Reebok Classic", sales: 198, revenue: 693000, trend: "down" },
];

const recentOrders: RecentOrder[] = [
  { id: "#4521", customer: "Rahul Mehta", product: "Nike Air Max 90", amount: 5999, status: "Delivered" },
  { id: "#4520", customer: "Priya Sharma", product: "Adidas Ultraboost", amount: 8499, status: "Processing" },
  { id: "#4519", customer: "Arjun Singh", product: "Puma RS-X3", amount: 4299, status: "Shipped" },
  { id: "#4518", customer: "Meena Patel", product: "New Balance 574", amount: 4999, status: "Pending" },
  { id: "#4517", customer: "Karan Malhotra", product: "Reebok Classic", amount: 3499, status: "Cancelled" },
];

const COLORS: string[] = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const statusStyles: Record<OrderStatus, string> = {
  Delivered:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Processing:
    "bg-blue-50 text-blue-700 border border-blue-200",
  Shipped:
    "bg-amber-50 text-amber-700 border border-amber-200",
  Pending:
    "bg-neutral-100 text-neutral-600 border border-neutral-200",
  Cancelled:
    "bg-red-50 text-red-600 border border-red-200",
};

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
        className={`flex items-center gap-1.5 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-500"
          }`}
      >
        {isUp ? (
          <ArrowUpRight size={13} />
        ) : (
          <ArrowDownRight size={13} />
        )}
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
}: TooltipContentProps<number, string>) => {
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

        const formattedValue =
          entry.dataKey === "revenue"
            ? `₹${(entry.value / 1000).toFixed(0)}K`
            : entry.value;

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Welcome back — heres whats happening today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value="₹29.4L"
          sub="Feb 2026"
          icon={IndianRupee}
          trend="up"
          trendVal="+11.3%"
          accent="bg-amber-500"
        />
        <StatCard
          label="Total Orders"
          value="5,450"
          sub="545 this month"
          icon={ShoppingBag}
          trend="up"
          trendVal="+8.7%"
          accent="bg-blue-500"
        />
        <StatCard
          label="New Customers"
          value="1,284"
          sub="Active buyers"
          icon={Users}
          trend="up"
          trendVal="+5.2%"
          accent="bg-emerald-500"
        />
        <StatCard
          label="Products Listed"
          value="342"
          sub="12 low stock"
          icon={Package}
          trend="down"
          trendVal="-2.1%"
          accent="bg-purple-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-800">Revenue & Orders</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Last 7 months performance</p>
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
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-neutral-600">{c.name}</span>
                </div>
                <span className="font-semibold text-neutral-800">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Top Products Bar Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-neutral-800">Top Products by Sales</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Units sold this month</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={130} />
              <Tooltip cursor={{ fill: "#fef9ec" }} formatter={(v) => [`${v} units`, "Sales"]} />
              <Bar dataKey="sales" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders mini */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-neutral-800">Recent Orders</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Latest 5 transactions</p>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-800 truncate">{order.customer}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{order.product}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-neutral-800">₹{order.amount.toLocaleString()}</p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/orders"
            className="mt-4 w-full text-center text-[11px] text-amber-600 hover:text-amber-700 font-medium pt-3 border-t border-neutral-100 transition-colors"
          >
            View all orders →
          </Link>
        </div>
      </div>
    </div>
  );
}