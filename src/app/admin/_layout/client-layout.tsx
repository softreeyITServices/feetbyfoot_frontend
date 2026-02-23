"use client";

import AdminFooter from "@/component/admin/common/AdminFooter";
import AdminHeader from "@/component/admin/common/AdminHeader";
import AdminSidebar from "@/component/admin/common/AdminSidebar";
import { ReactNode, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <AdminHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div className="flex flex-1">
        <AdminSidebar collapsed={collapsed} />

        <div
          className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
            collapsed ? "pl-18" : "pl-62"
          }`}
        >
          <main className="flex-1 p-8">{children}</main>
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}