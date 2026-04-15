"use client";

import { useState } from "react";
import { AdminModal } from "@/component/admin/AdminModal";
import { AdminForm } from "../Adminform";

const GENDER_OPTIONS = [
  { label: "Mens", value: "MENS" },
  { label: "Womens", value: "WOMENS" },
  { label: "Kids", value: "KIDS" },
  { label: "Unisex", value: "UNISEX" },
];

const LENGTH_OPTIONS = [
  { label: "Ankle", value: "ANKLE" },
  { label: "Crew", value: "CREW" },
  { label: "No Show", value: "NO_SHOW" },
  { label: "Quarter", value: "QUARTER" },
  { label: "Knee High", value: "KNEE_HIGH" },
];

const CURRENCY_OPTIONS = [
  { label: "INR", value: "INR" },
  { label: "USD", value: "USD" },
];

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
          fields={[
            {
              key: "name",
              label: "Product Name",
              type: "text",
              placeholder: "e.g. Nike Ankle Cotton Socks",
              required: true,
              cols: 1,
            },
            {
              key: "slug",
              label: "Slug",
              type: "text",
              placeholder: "e.g. nike-ankle-cotton-socks",
              required: true,
              cols: 1,
            },
            {
              key: "brand",
              label: "Brand",
              type: "text",
              placeholder: "e.g. FeetByFoot",
              required: true,
              cols: 1,
            },
            {
              key: "length",
              label: "Length",
              type: "select",
              placeholder: "Select length",
              required: true,
              options: LENGTH_OPTIONS,
              cols: 1,
            },
            {
              key: "price",
              label: "Price",
              type: "number",
              placeholder: "0",
              required: true,
              cols: 1,
            },
            {
              key: "salePrice",
              label: "Sale Price",
              type: "number",
              placeholder: "0",
              cols: 1,
            },
            {
              key: "currency",
              label: "Currency",
              type: "select",
              placeholder: "Select currency",
              required: true,
              options: CURRENCY_OPTIONS,
              cols: 1,
            },
            {
              key: "gender",
              label: "Gender",
              type: "multiselect",
              placeholder: "Select gender(s)",
              required: true,
              options: GENDER_OPTIONS,
              cols: 1,
            },
            {
              key: "description",
              label: "Description",
              type: "textarea",
              placeholder: "Product description...",
              cols: 2,
            },
            {
              key: "categoryId",
              label: "Category ID",
              type: "text",
              placeholder: "e.g. 697341cc480213bcaa2337de",
              required: true,
              cols: 1,
            },
            {
              key: "categoryTypeId",
              label: "Category Type ID",
              type: "text",
              placeholder: "e.g. 6974940546f8b7566be03d82",
              required: true,
              cols: 1,
            },
            {
              key: "tags",
              label: "Tags",
              type: "multiselect",
              placeholder: "Add tags",
              allowCustom: true,
              options: [],
              cols: 2,
            },
            {
              key: "sizes",
              label: "Sizes & Stock",
              type: "sizes",
              cols: 2,
            },
            {
              key: "imageUrls",
              label: "Images",
              type: "image",
              accept: "image/*",
              multiple: true,
              cols: 2,
            },
            {
              key: "isNewArrival",
              label: "New Arrival",
              type: "checkbox",
              cols: 1,
            },
            {
              key: "isBestseller",
              label: "Bestseller",
              type: "checkbox",
              cols: 1,
            },
            {
              key: "isGiftPack",
              label: "Gift Pack",
              type: "checkbox",
              cols: 1,
            },
          ]}
          onValuesChange={(next, prev) => {
            // Auto-generate slug from name
            if (next.name !== prev.name && typeof next.name === "string") {
              return {
                ...next,
                slug: next.name
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9\s-]/g, "")
                  .replace(/\s+/g, "-"),
              };
            }
          }}
          onSubmit={(values) => {
            console.log("payload:", values);
            setOpen(false);
          }}
        />
      </AdminModal>
    </>
  );
}
