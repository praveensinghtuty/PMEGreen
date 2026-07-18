import type { Database } from "@/types/supabase";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export type ShippingAddressSnapshot = {
  address_line_1: string;
  address_line_2?: null | string;
  city: string;
  district: string;
  full_name: string;
  label?: string;
  landmark?: null | string;
  phone: string;
  postal_code: string;
  state: string;
};

export type CustomerOrderListItem = {
  createdAt: string;
  id: string;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  totalAmount: number;
};

export type CustomerOrderDetail = CustomerOrderListItem & {
  courierName: null | string;
  customerEmail: null | string;
  customerName: string;
  customerNotes: null | string;
  customerPhone: string;
  discountAmount: number;
  items: CustomerOrderItem[];
  placedAt: string;
  shippingAddress: ShippingAddressSnapshot;
  shippingCharge: number;
  statusHistory: CustomerOrderStatusHistory[];
  subtotal: number;
  trackingNumber: null | string;
  trackingUrl: null | string;
  upiTransactionReference: null | string;
};

export type CustomerOrderItem = {
  id: string;
  lineTotal: number;
  productName: string;
  quantity: number;
  sku: null | string;
  unitPrice: number;
  variantName: string;
};

export type CustomerOrderStatusHistory = {
  createdAt: string;
  fromStatus: null | OrderStatus;
  id: string;
  note: null | string;
  toStatus: OrderStatus;
};
