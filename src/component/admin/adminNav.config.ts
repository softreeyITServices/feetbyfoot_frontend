import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavChild {
  label: string;
  href: string;
}

export interface AdminNavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: AdminNavChild[];
}

export const ADMIN_NAV: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { label: "All Orders", href: "/admin/orders" },
      { label: "Returns", href: "/admin/orders/returns" },
    ],
  },
  {
    label: "Products",
    icon: Package,
    children: [
      { label: "All Products", href: "/admin/products" },
      { label: "Categories", href: "/admin/categories" },
    ],
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];