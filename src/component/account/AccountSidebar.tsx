import { authService } from "@/domain/application/services/auth.service";
import { signOut } from "next-auth/react";
import Link from "next/link";

const menu = [
  { label: "Dashboard", active: true, href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Downloads", href: "/account/downloads" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Account details", href: "/account/details" },
  { label: "Log out", href: "#" },
];

const handleLogout = async (e: React.MouseEvent) => {
  e.preventDefault(); // ⛔ stop Link navigation
  await signOut({ callbackUrl: "/login" }); // clear NextAuth session
};

export default function AccountSidebar() {
  return (
    <aside className="border rounded-md overflow-hidden">
      {menu.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={item.label === "Log out" ? handleLogout : undefined}
          className={`flex items-center px-4 py-3 text-sm border-b last:border-b-0
            ${
              item.active
                ? "bg-black text-white font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }
          `}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
