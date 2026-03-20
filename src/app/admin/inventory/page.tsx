"use client";

import { AdminSectionPlaceholder } from "@/component/admin/common/AdminSectionPlaceholder";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <AdminSectionPlaceholder
        title="Inventory & Stock Management"
        description="Track stock levels, low-stock alerts, and automated updates after purchases."
      />
    </div>
  );
}

