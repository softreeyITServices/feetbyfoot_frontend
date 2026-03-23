import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  type LucideIcon,
  ImageIcon,
  DollarSignIcon,
  PercentIcon,
  MailIcon,
  BookIcon,
  LayoutPanelTopIcon,
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
      { label: "Exchanges", href: "/admin/orders/exchange" },
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
    label: "Banners",
    href: "/admin/banners",
    icon: ImageIcon,
  },
  {
    label: "Platforms Fees",
    href: "/admin/platforms-fees",
    icon: DollarSignIcon,
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: PercentIcon,
  },
  {
    label: "Contact",
    href: "/admin/contact",
    icon: MailIcon,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: BookIcon,
  },
  {
    label: "CMS",
    href: "/admin/cms",
    icon: LayoutPanelTopIcon,
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