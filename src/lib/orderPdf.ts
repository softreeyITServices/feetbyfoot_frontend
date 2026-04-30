import { PaymentStatus } from "@/domain/shared/types/order.type";

/** Invoice download when payment is completed; order status is not gated here. */
export function canDownloadOrderInvoicePdf(order: {
  paymentStatus: PaymentStatus;
}): boolean {
  return [
    PaymentStatus.PAID,
    PaymentStatus.REFUNDED,
    PaymentStatus.PARTIALLY_REFUNDED,
  ].includes(order.paymentStatus);
}
