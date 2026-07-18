import "server-only";

import { notFound } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/features/auth/queries/current-user";
import type {
  CustomerOrderDetail,
  CustomerOrderListItem,
  ShippingAddressSnapshot,
} from "@/features/orders/types/order";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";

const orderIdSchema = z.string().uuid();

function shippingAddressSnapshot(value: Json): ShippingAddressSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      address_line_1: "Unavailable address snapshot",
      city: "",
      district: "",
      full_name: "Customer",
      phone: "",
      postal_code: "",
      state: "Tamil Nadu",
    };
  }

  const record = value as Record<string, unknown>;
  const read = (key: string) =>
    typeof record[key] === "string" ? record[key] : "";

  return {
    address_line_1: read("address_line_1"),
    address_line_2: read("address_line_2") || null,
    city: read("city"),
    district: read("district"),
    full_name: read("full_name"),
    label: read("label"),
    landmark: read("landmark") || null,
    phone: read("phone"),
    postal_code: read("postal_code"),
    state: read("state") || "Tamil Nadu",
  };
}

function safeExternalUrl(value: null | string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function getCustomerOrders(): Promise<CustomerOrderListItem[]> {
  const user = await requireUser("/orders");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_method, payment_status, total_amount, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load orders");
  }

  return data.map((order) => ({
    createdAt: order.created_at,
    id: order.id,
    orderNumber: order.order_number,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    status: order.status,
    totalAmount: order.total_amount,
  }));
}

export async function getCustomerOrderDetail(
  rawOrderId: string,
): Promise<CustomerOrderDetail> {
  const parsed = orderIdSchema.safeParse(rawOrderId);

  if (!parsed.success) {
    notFound();
  }

  const user = await requireUser(`/orders/${rawOrderId}`);
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_method, payment_status, subtotal, shipping_charge, discount_amount, total_amount, customer_name, customer_phone, customer_email, shipping_address, customer_notes, courier_name, tracking_number, tracking_url, upi_transaction_reference, placed_at, created_at",
    )
    .eq("id", parsed.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !order) {
    notFound();
  }

  const [
    { data: items, error: itemError },
    { data: history, error: historyError },
  ] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        "id, product_name, variant_name, sku, quantity, unit_price, line_total",
      )
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_status_history")
      .select("id, from_status, to_status, note, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);

  if (itemError || historyError) {
    throw new Error("Unable to load order details");
  }

  return {
    courierName: order.courier_name,
    createdAt: order.created_at,
    customerEmail: order.customer_email,
    customerName: order.customer_name,
    customerNotes: order.customer_notes,
    customerPhone: order.customer_phone,
    discountAmount: order.discount_amount,
    id: order.id,
    items: items.map((item) => ({
      id: item.id,
      lineTotal: item.line_total,
      productName: item.product_name,
      quantity: item.quantity,
      sku: item.sku,
      unitPrice: item.unit_price,
      variantName: item.variant_name,
    })),
    orderNumber: order.order_number,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    placedAt: order.placed_at,
    shippingAddress: shippingAddressSnapshot(order.shipping_address),
    shippingCharge: order.shipping_charge,
    status: order.status,
    statusHistory: history.map((entry) => ({
      createdAt: entry.created_at,
      fromStatus: entry.from_status,
      id: entry.id,
      note: entry.note,
      toStatus: entry.to_status,
    })),
    subtotal: order.subtotal,
    totalAmount: order.total_amount,
    trackingNumber: order.tracking_number,
    trackingUrl: safeExternalUrl(order.tracking_url),
    upiTransactionReference: order.upi_transaction_reference,
  };
}
