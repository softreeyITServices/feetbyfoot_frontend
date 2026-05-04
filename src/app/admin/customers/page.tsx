"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { CustomerService } from "@/domain/application/services/admin/customer.service";
import type {
  AdminCustomer,
  CustomerOrder,
} from "@/domain/shared/types/admin/customer";
import { isGetRequestError } from "@/lib/httpClientError";

type CustomerRow = AdminCustomer & { id: string };

export default function CustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [ordersOpen, setOrdersOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(
    null
  );
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response:any = await CustomerService.getAll({
        page,
        limit,
        search: searchQuery || undefined,
      });

      console.log('response',response)

      setRows(
        response?.data?.map((customer:any) => ({
          ...customer,
          id: customer._id,
        }))
      );
      setTotalPages(1); // Set to 1 as API does not provide pagination
    } catch (error: unknown) {
      if (!isGetRequestError(error)) {
        toast.error(
          (error as { message?: string })?.message ||
            "Failed to load customers"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery]);

  const fetchCustomerOrders = useCallback(
    async (customerId: string, targetPage = 1) => {
      try {
        setOrdersLoading(true);
        const response:any = await CustomerService.getOrders(customerId, {
          page: targetPage,
          limit: 10,
        });
        console.log('response',response)
        setOrders(response.data);
        setOrdersPage(response.pagination.page);
        setOrdersTotalPages(Math.max(1, response.pagination.totalPages || 1));
      } catch (error: unknown) {
        if (!isGetRequestError(error)) {
          toast.error(
            (error as { message?: string })?.message ||
              "Failed to load customer orders"
          );
        }
      } finally {
        setOrdersLoading(false);
      }
    },
    []
  );

  const handleDelete = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await CustomerService.softDelete(customerId);
      toast.success("Customer deleted successfully");
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const handleCleanup = async () => {
    if (!confirm("Delete all customers inactive for > 1 year?")) return;
    try {
      const res = await CustomerService.cleanupInactive();
      toast.success(`Cleanup complete! ${res.count || 0} users deleted.`);
      fetchCustomers();
    } catch (error) {
      toast.error("Cleanup failed");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const columns: Column<CustomerRow>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            {row.role}
          </span>
          {(row as any).isInactive && (
            <span className="px-2 py-0.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 animate-pulse">
              Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Customers
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Manage customer accounts and order history.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleCleanup}
          className="h-9 px-4 text-xs font-semibold text-white bg-neutral-800 rounded-lg hover:bg-black transition-colors"
        >
          🧹 Cleanup Inactive Users
        </button>
      </div>

      <DataTable<CustomerRow>
        title="Customer List"
        description={loading ? "Loading customers..." : "Latest customers first"}
        columns={columns}
        data={rows}
        searchKeys={["name", "email", "phone"]}
        loading={loading}
        selectable={false}
        paginationMode="server"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={limit}
        onPageSizeChange={(nextSize) => {
          setLimit(nextSize);
          setPage(1);
        }}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        onView={async (row) => {
          setSelectedCustomer(row);
          setOrdersOpen(true);
          await fetchCustomerOrders(row._id, 1);
        }}
        onDelete={(row) => handleDelete(row._id)}
        canDelete={(row: any) => row.isInactive}
      />

      <AdminModal
        isOpen={ordersOpen}
        onClose={() => {
          setOrdersOpen(false);
          setSelectedCustomer(null);
          setOrders([]);
        }}
        title={selectedCustomer ? `${selectedCustomer.name} - Orders` : "Orders"}
        description={selectedCustomer ? selectedCustomer.email : ""}
        size="xl"
      >
        <div className="space-y-4">
          {ordersLoading ? (
            <p className="text-sm text-neutral-500">Loading orders...</p>
          ) : orders?.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 pr-2">Order No</th>
                    <th className="text-left py-2 pr-2">Order Status</th>
                    <th className="text-left py-2 pr-2">Payment Status</th>
                    <th className="text-left py-2 pr-2">Amount</th>
                    <th className="text-left py-2 pr-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order._id} className="border-b border-neutral-100">
                      <td className="py-2 pr-2">{order.orderNumber}</td>
                      <td className="py-2 pr-2">{order.orderStatus}</td>
                      <td className="py-2 pr-2">{order.paymentStatus}</td>
                      <td className="py-2 pr-2">
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-2 pr-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                selectedCustomer &&
                fetchCustomerOrders(
                  selectedCustomer._id,
                  Math.max(1, ordersPage - 1)
                )
              }
              disabled={ordersPage <= 1 || ordersLoading}
              className="h-8 px-3 text-xs border border-neutral-200 rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-xs text-neutral-500">
              Page {ordersPage} of {ordersTotalPages}
            </span>
            <button
              onClick={() =>
                selectedCustomer &&
                fetchCustomerOrders(
                  selectedCustomer._id,
                  Math.min(ordersTotalPages, ordersPage + 1)
                )
              }
              disabled={ordersPage >= ordersTotalPages || ordersLoading}
              className="h-8 px-3 text-xs border border-neutral-200 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

