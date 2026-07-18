"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/queries/current-user";
import { checkoutSubmissionSchema } from "@/features/checkout/schemas/checkout";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : undefined;
}

function checkoutError(code: string): never {
  redirect(`/checkout?checkoutError=${encodeURIComponent(code)}`);
}

export async function placeOrderAction(formData: FormData) {
  const parsed = checkoutSubmissionSchema.safeParse({
    addressId: value(formData, "addressId"),
    customerNotes: value(formData, "customerNotes"),
    idempotencyKey: value(formData, "idempotencyKey"),
    paymentMethod: value(formData, "paymentMethod"),
    upiReference: value(formData, "upiReference"),
  });

  if (!parsed.success) {
    checkoutError("invalid");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?next=%2Fcheckout");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("place_customer_order", {
      p_address_id: parsed.data.addressId,
      p_customer_notes: parsed.data.customerNotes ?? undefined,
      p_idempotency_key: parsed.data.idempotencyKey,
      p_payment_method: parsed.data.paymentMethod,
      p_upi_transaction_reference: parsed.data.upiReference ?? undefined,
    })
    .single();

  if (error || !data) {
    checkoutError("place-failed");
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/orders");
  redirect(`/orders/${data.order_id}?placed=1`);
}
