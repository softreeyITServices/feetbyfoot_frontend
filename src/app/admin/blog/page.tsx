import Link from "next/link";
import React from "react";

function AdminBlogPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
        Blog
      </h1>
      <p className="text-sm text-neutral-400">
        Manage content, announcements, and SEO stories.
      </p>
      <Link
        href="/admin/dashboard"
        className="inline-flex text-xs text-amber-600 hover:text-amber-700 font-medium"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}

export default AdminBlogPage;