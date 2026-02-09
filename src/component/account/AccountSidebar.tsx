import Link from "next/link";

const menu = [
  { label: "Dashboard", active: true },
  { label: "Orders" },
  { label: "Downloads" },
  { label: "Addresses" },
  { label: "Account details" },
  { label: "Log out" },
];

export default function AccountSidebar() {
  return (
    <aside className="border rounded-md overflow-hidden">
      {menu.map((item) => (
        <Link
          key={item.label}
          href="#"
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
