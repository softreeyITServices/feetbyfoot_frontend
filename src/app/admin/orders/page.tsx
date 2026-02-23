"use client";

import React, { useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { AdminForm, FormField } from "@/component/admin/Adminform";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Active" | "Inactive";
}

/* ================= SAMPLE DATA ================= */

const SAMPLE_PRODUCTS: Product[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  name: [
    "Nike Air Max 90",
    "Adidas Ultraboost 23",
    "Puma RS-X3",
    "New Balance 574",
    "Reebok Classic",
    "Skechers GoRun",
    "ASICS Gel-Kayano",
  ][i % 7],
  category: ["Running", "Casual", "Formal", "Sports", "Kids"][i % 5],
  price: [4999, 8499, 4299, 4999, 3499, 3999, 6499][i % 7],
  stock: Math.floor(Math.random() * 100) + 1,
  status: i % 4 === 0 ? "Inactive" : "Active",
}));

/* ================= STATUS STYLE ================= */

const STATUS_STYLE: Record<Product["status"], string> = {
  Active:
    "px-2 py-0.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200",
  Inactive:
    "px-2 py-0.5 text-xs rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-200",
};

/* ================= TABLE COLUMNS ================= */

const PRODUCT_COLUMNS: Column<Product>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Product Name", sortable: true },
  { key: "category", label: "Category", sortable: true },
  {
    key: "price",
    label: "Price",
    sortable: true,
    render: (row) => <>₹{row.price.toLocaleString()}</>,
  },
  {
    key: "stock",
    label: "Stock",
    sortable: true,
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span className={STATUS_STYLE[row.status]}>
        {row.status}
      </span>
    ),
  },
];

/* ================= FORM FIELDS ================= */

const PRODUCT_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Product Name",
    type: "text",
    required: true,
    cols: 1,
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    required: true,
    cols: 1,
    options: [
      { label: "Running", value: "Running" },
      { label: "Casual", value: "Casual" },
      { label: "Formal", value: "Formal" },
      { label: "Sports", value: "Sports" },
      { label: "Kids", value: "Kids" },
    ],
  },
  {
    key: "price",
    label: "Price (₹)",
    type: "number",
    required: true,
    cols: 1,
  },
  {
    key: "stock",
    label: "Stock",
    type: "number",
    required: true,
    cols: 1,
  },
  {
    key: "status",
    label: "Status",
    type: "radio",
    required: true,
    cols: 2,
    options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ],
  },
];

/* ================= PAGE ================= */

function OrderPage() {
  const [open, setOpen] = useState(false);

  const handleCreate = async (values: Record<string, unknown>) => {
    const newProduct: Product = {
      id: SAMPLE_PRODUCTS.length + 1,
      name: String(values.name),
      category: String(values.category),
      price: Number(values.price),
      stock: Number(values.stock),
      status: values.status as Product["status"],
    };

    console.log("Created:", newProduct);

    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Products
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Manage your product catalog
        </p>
      </div>

      <DataTable<Product>
        title="All Products"
        description="Sortable, searchable, paginated product list"
        columns={PRODUCT_COLUMNS}
        data={SAMPLE_PRODUCTS}
        searchKeys={["name", "category", "status"]}
        onAdd={() => setOpen(true)}
        onEdit={(row) => alert(row.name)}
        onDelete={(row) => alert(row.name)}
        onView={(row) => alert(row.name)}
      />

      {/* ================= MODAL ================= */}

      <AdminModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create Product"
        description="Fill product details below"
        size="lg"
      >
        <AdminForm
          fields={PRODUCT_FIELDS}
          initialValues={{
            name: "",
            category: "",
            price: "",
            stock: "",
            status: "Active",
          }}
          submitLabel="Create Product"
          onSubmit={handleCreate}
          onCancel={() => setOpen(false)}
        />
      </AdminModal>
    </div>
  );
}

export default OrderPage;