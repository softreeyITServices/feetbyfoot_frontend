"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Column, DataTable } from "@/component/admin/Admindatatable"

interface Product {
  id: string
  name: string
  brand?: string
  salePrice?: number
  isActive?: boolean
}

const PRODUCT_COLUMNS: Column<Product>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Product Name", sortable: true },
  {
    key: "brand",
    label: "Brand",
    render: (row) => row.brand ?? "-",
  },
  {
    key: "salePrice",
    label: "Price",
    sortable: true,
    render: (row) => (row.salePrice ? `₹${row.salePrice}` : "-"),
  },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (
      <span
        className={
          row.isActive
            ? "px-2 py-0.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "px-2 py-0.5 text-xs rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-200"
        }
      >
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
]

function ProductPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?page=1&limit=50`,
        {
          headers: {
            Authorization: `Bearer YOUR_ACCESS_TOKEN`,
          },
        }
      )

      const data = await res.json()

      setProducts(data.products)
    }

    load()
  }, [])

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
        data={products}
        searchKeys={["name"]}
        onAdd={() => router.push("/admin/products/create")}
        onEdit={(row) => router.push(`/admin/products/${row.id}/edit`)}
        onView={(row) => router.push(`/admin/products/${row.id}`)}
        onDelete={(row) => console.log("delete", row.id)}
      />
    </div>
  )
}

export default ProductPage