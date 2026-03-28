"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ADMIN_NAV } from "../adminNav.config";

interface AdminSidebarProps {
  collapsed: boolean;
}

export default function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    const activeParents = ADMIN_NAV.filter((item) =>
      item.children?.some(
        (child) => pathname === child.href || pathname.startsWith(child.href + "/")
      )
    ).map((item) => item.label);

    setOpenMenus((prev) => Array.from(new Set([...prev, ...activeParents])));
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] 
        bg-[#111113] border-r border-white/6
        text-neutral-400 transition-all duration-300 ease-in-out z-40
        flex flex-col
        ${collapsed ? "w-18" : "w-62"}`}
    >
      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden mt-3 px-2 flex flex-col gap-0.5">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;

          const isChildActive =
            item.children?.some((child) => pathname.startsWith(child.href)) ?? false;

          const isActive =
            item.href &&
            (pathname === item.href || pathname.startsWith(item.href + "/"));

          const active = isActive || isChildActive;

          if (item.children) {
            const isOpen = openMenus.includes(item.label);

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 group
                    ${
                      active
                        ? "bg-amber-500/10 text-amber-400"
                        : "hover:bg-white/5 hover:text-neutral-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      strokeWidth={active ? 2 : 1.5}
                      className={active ? "text-amber-400" : "text-neutral-500 group-hover:text-neutral-300"}
                    />
                    {!collapsed && (
                      <span className="text-[13px] font-medium">{item.label}</span>
                    )}
                  </div>

                  {!collapsed && (
                    <ChevronRight
                      size={13}
                      className={`text-neutral-600 transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="ml-7 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-white/6 pl-3">
                    {item.children.map((child) => {
                      const childActive =
                        pathname === child.href ||
                        pathname.startsWith(child.href + "/");

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`text-[12px] px-2 py-1.5 rounded-md transition-all duration-150
                            ${
                              childActive
                                ? "text-amber-400 font-medium"
                                : "text-neutral-500 hover:text-neutral-200"
                            }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group
                ${
                  active
                    ? "bg-amber-500/10 text-amber-400"
                    : "hover:bg-white/5 hover:text-neutral-200"
                }`}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2 : 1.5}
                className={active ? "text-amber-400" : "text-neutral-500 group-hover:text-neutral-300"}
              />
              {!collapsed && (
                <span className="text-[13px] font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="p-3 border-t border-white/6">
          <div className="rounded-lg bg-white/4 px-3 py-2.5 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">AS</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] font-medium text-neutral-200 truncate">Admin Super</p>
              <p className="text-[11px] text-neutral-500 truncate">admin@feetbyfoot.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}