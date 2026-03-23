"use client";

import { AdminModal } from "@/component/admin/AdminModal";
import { Order } from "@/domain/shared/types/order.type";

type Props = {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
};

export function OrderDetailsModal({ order, isOpen, onClose }: Props) {
  if (!order) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Details"
      description="Detailed view of the order"
      size="lg"
      footer={
        <button
          onClick={onClose}
          className="h-8 px-4 text-xs font-medium text-white bg-black rounded-lg hover:bg-neutral-800"
        >
          Close
        </button>
      }
    >
      <div className="space-y-2 text-sm">
        <p>
          <b>Order:</b> {order.orderNumber}
        </p>
        <p>
          <b>Customer:</b> {order.shippingAddress.fullName}
        </p>
        <p>
          <b>Total:</b> ₹{order.totalAmount}
        </p>

        <div className="mt-4">
          <b>Items:</b>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {order.items.map((item) => (
              <li key={item._id}>
                {item.productName} ({item.size}) × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminModal>
  );
}