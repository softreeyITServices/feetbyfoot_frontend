"use client";

import { AdminSectionPlaceholder } from "@/component/admin/common/AdminSectionPlaceholder";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <AdminSectionPlaceholder
        title="Customer Management"
        description="Manage customer accounts, order history, and addresses."
      />
    </div>
  );
}

