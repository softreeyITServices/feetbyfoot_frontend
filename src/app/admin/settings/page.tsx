"use client";

import { AdminSectionPlaceholder } from "@/component/admin/common/AdminSectionPlaceholder";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminSectionPlaceholder
        title="Admin Settings"
        description="Configure promotions, CMS content, and role-based access (RBAC)."
      />
    </div>
  );
}

