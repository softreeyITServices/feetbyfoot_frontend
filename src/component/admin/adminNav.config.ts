import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  SlidersHorizontal,
  type LucideIcon,
  ImageIcon,
  DollarSignIcon,
  PercentIcon,
  MailIcon,
  BookIcon,
  LayoutPanelTopIcon,
  Users,
  Rows3,
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
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
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
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { label: "All Orders", href: "/admin/orders" },
      { label: "Exchanges", href: "/admin/orders/exchange" },
      { label: "Returns", href: "/admin/orders/returns" },
    ],
  },
  {
    label: "CMS",
    href: "/admin/cms",
    icon: LayoutPanelTopIcon,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: BookIcon,
  },
  {
    label: "Contact",
    href: "/admin/contact",
    icon: MailIcon,
  },
  {
    label: "Settings",
    icon: SlidersHorizontal,
    children: [
      { label: "Menu Creation", href: "/admin/menu" },
      { label: "Home marquee", href: "/admin/settings/marquee" },
      { label: "Home Banners", href: "/admin/banners" },
      { label: "Section Banners", href: "/admin/section-banners" },
      { label: "Customer Showcase", href: "/admin/showcase" },
      { label: "Platforms Fees", href: "/admin/platforms-fees" },
      { label: "Coupons", href: "/admin/coupons" },
    ],
  },
];