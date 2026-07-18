"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/queries/current-user";
import {
  addressIdSchema,
  addressMutationSchema,
} from "@/features/addresses/schemas/address";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : undefined;
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

async function requireActionUser(returnPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(returnPath)}`);
  }

  return user;
}

function redirectWithError(returnPath: string, error: string): never {
  const separator = returnPath.includes("?") ? "&" : "?";
  redirect(
    `${returnPath}${separator}addressError=${encodeURIComponent(error)}`,
  );
}

async function clearOtherDefaults(userId: string, exceptAddressId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true);

  if (exceptAddressId) {
    query = query.neq("id", exceptAddressId);
  }

  const { error } = await query;

  if (error) {
    throw new Error("Unable to update default address");
  }
}

export async function saveAddressAction(formData: FormData) {
  const parsed = addressMutationSchema.safeParse({
    addressLine1: value(formData, "addressLine1"),
    addressLine2: value(formData, "addressLine2"),
    city: value(formData, "city"),
    district: value(formData, "district"),
    fullName: value(formData, "fullName"),
    id: value(formData, "id"),
    isDefault: checkbox(formData, "isDefault"),
    label: value(formData, "label"),
    landmark: value(formData, "landmark"),
    phone: value(formData, "phone"),
    postalCode: value(formData, "postalCode"),
    returnPath: value(formData, "returnPath"),
    state: value(formData, "state"),
  });

  if (!parsed.success) {
    redirectWithError(value(formData, "returnPath") ?? "/addresses", "invalid");
  }

  const user = await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { data: existingAddress, error: existingAddressError } = parsed.data.id
    ? await supabase
        .from("addresses")
        .select("id, is_default")
        .eq("id", parsed.data.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null, error: null };

  if (existingAddressError || (parsed.data.id && !existingAddress)) {
    redirectWithError(parsed.data.returnPath, "save-failed");
  }

  const { count: existingAddressCount } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const shouldBeDefault =
    parsed.data.isDefault ||
    (!parsed.data.id && (existingAddressCount ?? 0) === 0) ||
    Boolean(existingAddress?.is_default);

  if (shouldBeDefault) {
    await clearOtherDefaults(user.id, parsed.data.id);
  }

  const row = {
    address_line_1: parsed.data.addressLine1,
    address_line_2: parsed.data.addressLine2,
    city: parsed.data.city,
    district: parsed.data.district,
    full_name: parsed.data.fullName,
    is_default: shouldBeDefault,
    label: parsed.data.label,
    landmark: parsed.data.landmark,
    phone: parsed.data.phone,
    postal_code: parsed.data.postalCode,
    state: parsed.data.state,
    user_id: user.id,
  };

  const result = parsed.data.id
    ? await supabase
        .from("addresses")
        .update(row)
        .eq("id", parsed.data.id)
        .eq("user_id", user.id)
    : await supabase.from("addresses").insert(row);

  if (result.error) {
    redirectWithError(parsed.data.returnPath, "save-failed");
  }

  revalidatePath("/addresses");
  revalidatePath("/checkout");
  redirect(parsed.data.returnPath);
}

export async function deleteAddressAction(formData: FormData) {
  const parsed = addressIdSchema.safeParse({
    id: value(formData, "id"),
    returnPath: value(formData, "returnPath"),
  });

  if (!parsed.success) {
    redirectWithError("/addresses", "delete-failed");
  }

  const user = await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .select("id, is_default")
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (addressError || !address) {
    redirectWithError(parsed.data.returnPath, "delete-failed");
  }

  const { count: orderCount, error: orderError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .contains("shipping_address", { source_address_id: parsed.data.id });

  if (orderError || (orderCount ?? 0) > 0) {
    redirectWithError(parsed.data.returnPath, "delete-blocked");
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    redirectWithError(parsed.data.returnPath, "delete-failed");
  }

  if (address.is_default) {
    const { data: replacement } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (replacement) {
      await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", replacement.id)
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/addresses");
  revalidatePath("/checkout");
  redirect(parsed.data.returnPath);
}

export async function setDefaultAddressAction(formData: FormData) {
  const parsed = addressIdSchema.safeParse({
    id: value(formData, "id"),
    returnPath: value(formData, "returnPath"),
  });

  if (!parsed.success) {
    redirectWithError("/addresses", "default-failed");
  }

  const user = await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (addressError || !address) {
    redirectWithError(parsed.data.returnPath, "default-failed");
  }

  await clearOtherDefaults(user.id, parsed.data.id);
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    redirectWithError(parsed.data.returnPath, "default-failed");
  }

  revalidatePath("/addresses");
  revalidatePath("/checkout");
  redirect(parsed.data.returnPath);
}
