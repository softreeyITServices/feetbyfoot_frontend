"use client";

import React from "react";

export function AdminSectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
        {description && (
          <p className="text-xs text-neutral-500 leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
          <p className="text-[12px] font-medium text-amber-800">
            This section UI is scaffolded. Hook up the real admin logic when
            available.
          </p>
        </div>
      </div>
    </div>
  );
}

