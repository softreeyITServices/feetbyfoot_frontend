"use client";

import { AdminForm, FormField } from "@/component/admin/Adminform";

/* =========================================================
   PRODUCT FORM CONFIG
========================================================= */

const PRODUCT_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Product Name",
    type: "text",
    placeholder: "e.g. Nike Air Max 90",
    required: true,
    cols: 1,
  },
  {
    key: "sku",
    label: "SKU",
    type: "text",
    placeholder: "e.g. NK-AM90-BLK-42",
    required: true,
    cols: 1,
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    placeholder: "Select category",
    required: true,
    cols: 1,
    options: [
      { label: "Running", value: "running" },
      { label: "Casual", value: "casual" },
      { label: "Formal", value: "formal" },
      { label: "Sports", value: "sports" },
      { label: "Kids", value: "kids" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "radio",
    required: true,
    cols: 1,
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    key: "price",
    label: "Price (₹)",
    type: "number",
    placeholder: "0.00",
    required: true,
    cols: 1,
  },
  {
    key: "stock",
    label: "Stock Quantity",
    type: "number",
    placeholder: "0",
    required: true,
    cols: 1,
  },
  {
    key: "tags",
    label: "Tags",
    type: "multiselect",
    cols: 2,
    options: [
      { label: "New Arrival", value: "new" },
      { label: "Best Seller", value: "bestseller" },
      { label: "On Sale", value: "sale" },
      { label: "Limited Edition", value: "limited" },
      { label: "Featured", value: "featured" },
    ],
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Write a short product description...",
    cols: 2,
  },
  {
    key: "images",
    label: "Product Images",
    type: "image",
    accept: "image/*",
    multiple: true,
    cols: 2,
    hint: "Upload up to 5 images (PNG, JPG, WEBP).",
  },
  {
    key: "specSheet",
    label: "Spec Sheet",
    type: "file",
    accept: ".pdf,.doc,.docx",
    multiple: false,
    cols: 2,
    hint: "Optional — attach a PDF or Word document.",
  },
  {
    key: "featured",
    label: "Featured Product",
    type: "checkbox",
    placeholder: "Mark as featured on homepage",
    cols: 2,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Create Product
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Fill in the details below to add a new product to your catalog.
        </p>
      </div>

      <AdminForm
        title="Product Details"
        description="All fields marked * are required"
        fields={PRODUCT_FIELDS}
        initialValues={{
          name: "",
          sku: "",
          category: "",
          status: "draft",
          price: "",
          stock: "",
          description: "",
          featured: false,
          tags: [],
          images: [],
          specSheet: null,
        }}
        submitLabel="Save Product"
        onSubmit={async (values) => {
          const payload = {
            ...values,
            price: Number(values.price),
            stock: Number(values.stock),
          };

          await new Promise((resolve) => setTimeout(resolve, 1200));

          console.log("Product Submitted:", payload);

          // await productService.create(payload)
        }}
        onCancel={() => {
          console.log("Cancelled");
        }}
      />
    </div>
  );
}