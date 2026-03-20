"use client";

import { AdminSectionPlaceholder } from "@/component/admin/common/AdminSectionPlaceholder";

export default function RbacPage() {
  return (
    <div className="space-y-6">
      <AdminSectionPlaceholder
        title="Role-Based Access Control (RBAC)"
        description="Manage admin roles and permissions."
      />
    </div>
  );
}

