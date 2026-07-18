"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/queries/current-user";
import {
  cartAddSchema,
  cartItemMutationSchema,
  cartItemQuantitySchema,
  cartReturnPathSchema,
  type CartActionState,
} from "@/features/cart/schemas/cart";
import { createClient } from "@/lib/supabase/server";

function redirectToLogin(returnPath: string): never {
  redirect(`/auth/login?next=${encodeURIComponent(returnPath)}`);
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

async function requireActionUser(returnPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirectToLogin(returnPath);
  }

  return user;
}

export async function addVariantToCartAction(
  _previousState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = cartAddSchema.safeParse({
    quantity: formValue(formData, "quantity"),
    returnPath: formValue(formData, "returnPath"),
    variantId: formValue(formData, "variantId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Choose a valid active variant before adding it to the cart.",
    };
  }

  await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_active_variant_to_cart", {
    p_quantity: parsed.data.quantity,
    p_variant_id: parsed.data.variantId,
  });

  if (error) {
    return {
      status: "error",
      message: "This variant is not available in the requested quantity.",
    };
  }

  revalidatePath("/cart");
  revalidatePath(parsed.data.returnPath);

  return {
    status: "success",
    message: "Added to cart.",
  };
}

export async function updateCartItemQuantityAction(formData: FormData) {
  const parsed = cartItemQuantitySchema.safeParse({
    itemId: formValue(formData, "itemId"),
    quantity: formValue(formData, "quantity"),
    returnPath: formValue(formData, "returnPath"),
  });

  if (!parsed.success) {
    redirect("/cart?cartError=invalid-quantity");
  }

  await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { data: item, error: itemError } = await supabase
    .from("cart_items")
    .select("id, variant_id")
    .eq("id", parsed.data.itemId)
    .maybeSingle();

  if (itemError || !item) {
    redirect("/cart?cartError=item-not-found");
  }

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id, stock_quantity, track_inventory")
    .eq("id", item.variant_id)
    .eq("is_active", true)
    .maybeSingle();

  if (
    variantError ||
    !variant ||
    (variant.track_inventory && variant.stock_quantity < parsed.data.quantity)
  ) {
    redirect("/cart?cartError=unavailable");
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: parsed.data.quantity })
    .eq("id", parsed.data.itemId);

  if (error) {
    redirect("/cart?cartError=update-failed");
  }

  revalidatePath("/cart");
  redirect(parsed.data.returnPath);
}

export async function removeCartItemAction(formData: FormData) {
  const parsed = cartItemMutationSchema.safeParse({
    itemId: formValue(formData, "itemId"),
    returnPath: formValue(formData, "returnPath"),
  });

  if (!parsed.success) {
    redirect("/cart?cartError=item-not-found");
  }

  await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", parsed.data.itemId);

  if (error) {
    redirect("/cart?cartError=remove-failed");
  }

  revalidatePath("/cart");
  redirect(parsed.data.returnPath);
}

export async function clearCartAction(formData: FormData) {
  const parsed = cartReturnPathSchema.parse({
    returnPath: formValue(formData, "returnPath"),
  });
  const user = await requireActionUser(parsed.returnPath);
  const supabase = await createClient();
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (cart) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id);

    if (error) {
      redirect("/cart?cartError=clear-failed");
    }
  }

  revalidatePath("/cart");
  redirect(parsed.returnPath);
}
