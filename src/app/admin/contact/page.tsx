"use client";

import React, { useEffect, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";
import toast from "react-hot-toast";
import { contactService } from "@/domain/application/services/contact.service";
import { isGetRequestError } from "@/lib/httpClientError";

/* ================= TYPES ================= */

type Contact = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
};

type ContactRow = Contact & {
  id: string;
};

type PendingAction =
  | { type: "VIEW"; row: ContactRow }
  | { type: "RESOLVE"; row: ContactRow };

/* ================= PAGE ================= */

export default function ContactPage() {
  const [data, setData] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await contactService.getContacts();

      setData(res.map((x) => ({ ...x, id: x._id, name: x.fullName })));
    } catch (err: unknown) {
      if (!isGetRequestError(err)) {
        toast.error((err as { message?: string })?.message || "Failed to fetch contacts");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= RESOLVE ================= */

  const handleResolve = async () => {
    if (!pending || pending.type !== "RESOLVE") return;

    try {
      setActionLoading(true);
      await contactService.resolveContact(pending.row._id);

      toast.success("Marked as resolved");
      fetchData();
      setPending(null);
    } catch (err: any) {
      toast.error(err?.message || "Resolve failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= COLUMNS ================= */

  const columns: Column<ContactRow>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    {
      key: "message",
      label: "Message",
      render: (row) => (
        <p className="truncate max-w-[250px]">{row.message}</p>
      ),
    },
    {
      key: "isResolved",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg ${
            row.isResolved
              ? "bg-emerald-50 text-emerald-700"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {row.isResolved ? "Resolved" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) =>
        new Date(row.createdAt).toLocaleString(),
    },
    {
      key: "id",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => setPending({ type: "VIEW", row })}
            className="px-3 py-1 text-xs border rounded-lg"
          >
            View
          </button>

          {!row.isResolved && (
            <button
              onClick={() => setPending({ type: "RESOLVE", row })}
              className="px-3 py-1 text-xs bg-black text-white rounded-lg"
            >
              Resolve
            </button>
          )}
        </div>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">Contact Requests</h1>
        <p className="text-sm text-neutral-400">
          Manage user queries & messages
        </p>
      </div>

      {/* TABLE */}
      <DataTable
        title="All Contacts"
        description="User submitted contact forms"
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["name", "email"]}
      />

      {/* VIEW MODAL */}
      <AdminModal
        isOpen={pending?.type === "VIEW"}
        onClose={() => setPending(null)}
        title="Contact Details"
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setPending(null)}
              className="px-4 py-2 text-xs border rounded-lg"
            >
              Close
            </button>
          </div>
        }
      >
        {pending?.type === "VIEW" && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Name</p>
              <p className="font-medium">{pending.row.name}</p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">Email</p>
              <p className="font-medium">{pending.row.email}</p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">Message</p>
              <p className="mt-1 p-3 border rounded-xl bg-neutral-50">
                {pending.row.message}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">Status</p>
              <p className="font-medium">
                {pending.row.isResolved ? "Resolved" : "Pending"}
              </p>
            </div>
          </div>
        )}
      </AdminModal>

      {/* RESOLVE CONFIRM */}
      <ConfirmModal
        isOpen={pending?.type === "RESOLVE"}
        onClose={() => setPending(null)}
        onConfirm={handleResolve}
        loading={actionLoading}
        title="Resolve Contact"
        description={`Mark "${pending?.type === "RESOLVE" ? pending.row.name : ""}" as resolved?`}
      />
    </div>
  );
}
