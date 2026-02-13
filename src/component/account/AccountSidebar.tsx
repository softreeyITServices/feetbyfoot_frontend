"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardIcon } from "@/icons/DashboardIcon";
import { OrderIcon } from "@/icons/OrderIcon";
import { AddressAltIcon } from "@/icons/AddressAltIcon";
import { AccountIcon } from "@/icons/AccountIcon";
import { LogoutIcon } from "@/icons/LogoutIcon";

const menu = [
  { icon: DashboardIcon, label: "Dashboard", href: "/account" },
  { icon: OrderIcon, label: "Orders", href: "/account/orders" },
  { icon: AddressAltIcon, label: "Addresses", href: "/account/addresses" },
  { icon: AccountIcon, label: "Account details", href: "/account/details" },
  { icon: LogoutIcon, label: "Log out", href: "/account/logout" },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === "/account") {
      return pathname === "/account";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="overflow-hidden bg-white">
      {menu.map((item) => {
        const isActive =
          item.href !== "#" && isActiveRoute(item.href);

        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`
              relative flex items-center gap-3 px-5 py-3 text-md 
              transition-all duration-200
              ${isActive
                ? "bg-black text-amber-300 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }
            `}
          >
            {/* Left Active Indicator */}


            {/* Icon */}
            <Icon
              fill={isActive ? "#FBBF24" : "#6B7280"}
              className="w-4.5 h-4.5"
            />

            {/* Label */}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
