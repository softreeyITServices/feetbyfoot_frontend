"use client";

import { AdminSectionPlaceholder } from "@/component/admin/common/AdminSectionPlaceholder";

export default function CmsPage() {
  return (
    <div className="space-y-6">
      <AdminSectionPlaceholder
        title="Content Management (CMS)"
        description="Manage About, Contact, FAQ, policy pages, banners, and promotional content."
      />
    </div>
  );
}

