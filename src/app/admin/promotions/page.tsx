"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { AdminForm, FormField } from "@/component/admin/Adminform";
import { couponService } from "@/domain/application/services/coupon.service";
import type { Coupon } from "@/domain/shared/types/coupon.type";
import { isGetRequestError } from "@/lib/httpClientError";

interface CouponRow {
  id: string;
  code: string;
  discountType: Coupon["discountType"] | string;
  discountValue: number;
  expiryDate: string;
  isActive: boolean;
}

const mapCoupons = (items: any): CouponRow[] => {
  // Internal API response is wrapped by apiHandler createSuccessResponse:
  // { success: true, data: { message, data: Coupon[] }, timestamp }
  const raw = Array.isArray(items?.data?.data) ? items.data.data : [];

  return raw.map((c: any): CouponRow => ({
    id: String(c._id ?? c.id ?? ""),
    code: String(c.code ?? ""),
    discountType: String(c.discountType ?? ""),
    discountValue: Number(c.discountValue ?? 0),
    expiryDate: String(c.expiryDate ?? ""),
    isActive: Boolean(c.isActive),
  }));
};

const PROMOTION_FIELDS: FormField[] = [
  {
    key: "code",
    label: "Coupon Code",
    type: "text",
    required: true,
    cols: 1,
    placeholder: "e.g. SAVE10",
  },
  {
    key: "discountType",
    label: "Discount Type",
    type: "select",
    required: true,
    cols: 1,
    options: [
      { label: "FLAT", value: "FLAT" },
      { label: "PERCENTAGE", value: "PERCENTAGE" },
    ],
  },
  {
    key: "discountValue",
    label: "Discount Value",
    type: "number",
    required: true,
    cols: 1,
    placeholder: "e.g. 10",
  },
  {
    key: "minOrderValue",
    label: "Min Order Value",
    type: "number",
    required: true,
    cols: 1,
    placeholder: "e.g. 499",
  },
  {
    key: "expiryDate",
    label: "Expiry Date",
    type: "date",
    required: true,
    cols: 1,
  },
  {
    key: "maxUsage",
    label: "Max Usage",
    type: "number",
    required: true,
    cols: 1,
    placeholder: "e.g. 1000",
  },
  {
    key: "perUserLimit",
    label: "Per User Limit",
    type: "number",
    required: true,
    cols: 1,
    placeholder: "e.g. 2",
  },
  {
    key: "isActive",
    label: "Is Active",
    type: "checkbox",
    required: false,
    cols: 2,
    placeholder: "Active coupon",
  },
];

const columns: Column<CouponRow>[] = [
  { key: "code", label: "Code", sortable: true },
  { key: "discountType", label: "Type", sortable: true },
  { key: "discountValue", label: "Value", sortable: true },
  {
    key: "expiryDate",
    label: "Expiry",
    sortable: true,
    render: (row) => {
      if (!row.expiryDate) return "—";
      const d = new Date(row.expiryDate);
      if (Number.isNaN(d.getTime())) return row.expiryDate;
      return d.toLocaleDateString();
    },
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
];

export default function PromotionsPage() {
  const [rows, setRows] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const items = await couponService.getAllActiveCoupons();
      setRows(mapCoupons(items));
    } catch (error: unknown) {
      if (!isGetRequestError(error)) {
        toast.error((error as { message?: string })?.message || "Failed to load coupons");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const handleCreate = useCallback(
    async (values: Record<string, unknown>) => {
      const payload = {
        code: String(values.code ?? "").trim(),
        discountType: String(values.discountType ?? "").trim(),
        discountValue: Number(values.discountValue ?? 0),
        minOrderValue: Number(values.minOrderValue ?? 0),
        expiryDate: String(values.expiryDate ?? ""),
        maxUsage: Number(values.maxUsage ?? 0),
        perUserLimit: Number(values.perUserLimit ?? 0),
        isActive: Boolean(values.isActive),
      };

      await couponService.createCoupon(payload);
      toast.success("Coupon created");
      setOpen(false);
      await loadCoupons();
    },
    [loadCoupons]
  );

  const tableDescription = useMemo(() => {
    return loading
      ? "Loading coupons..."
      : "Create and view active coupons.";
  }, [loading]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Promotions & Discounts
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Coupons management
        </p>
      </div>

      <DataTable<CouponRow>
        title="Active Coupons"
        description={tableDescription}
        columns={columns}
        data={rows}
        searchKeys={["code", "discountType"]}
        onAdd={() => setOpen(true)}
        pageSize={10}
      />

      <AdminModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create Coupon"
        description="Add a new coupon"
        size="lg"
      >
        <AdminForm
          fields={PROMOTION_FIELDS}
          initialValues={{
            code: "",
            discountType: "",
            discountValue: "",
            minOrderValue: "",
            expiryDate: "",
            maxUsage: "",
            perUserLimit: "",
            isActive: false,
          }}
          submitLabel="Create Coupon"
          onSubmit={handleCreate}
          onCancel={() => setOpen(false)}
        />
      </AdminModal>
    </div>
  );
}

