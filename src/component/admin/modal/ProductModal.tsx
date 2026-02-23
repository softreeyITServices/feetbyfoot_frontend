"use client";

import { useState } from "react";
import { AdminModal } from "@/component/admin/AdminModal";
import { AdminForm } from "../Adminform";

export default function ProductModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-8 px-4 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600"
      >
        Add Product
      </button>

      <AdminModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create Product"
        description="Fill the product details below"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setOpen(false)}
              className="h-8 px-4 text-xs font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button className="h-8 px-5 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600">
              Save Product
            </button>
          </>
        }
      >
        <AdminForm
          fields={[]}
          onSubmit={() => {}}
        />
      </AdminModal>
    </>
  );
}