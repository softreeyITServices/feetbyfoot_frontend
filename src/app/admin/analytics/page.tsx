"use client";

import { AdminSectionPlaceholder } from "@/component/admin/common/AdminSectionPlaceholder";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminSectionPlaceholder
        title="Reports & Analytics"
        description="Sales, revenue, product performance, order statistics, and customer insights."
      />
    </div>
  );
}

