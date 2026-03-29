import { PaymentStatus } from "@/domain/shared/types/order.type";

/** Invoice download when payment is completed; order status is not gated here. */
export function canDownloadOrderInvoicePdf(order: {
  paymentStatus: PaymentStatus;
}): boolean {
  return order.paymentStatus === PaymentStatus.PAID;
}
