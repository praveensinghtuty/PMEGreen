"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/queries/current-user";
import { wishlistMutationSchema } from "@/features/wishlist/schemas/wishlist";
import { createClient } from "@/lib/supabase/server";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function redirectToLogin(returnPath: string): never {
  redirect(`/auth/login?next=${encodeURIComponent(returnPath)}`);
}

function appendError(path: string, key: string, value: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

async function requireActionUser(returnPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirectToLogin(returnPath);
  }

  return user;
}

export async function addProductToWishlistAction(formData: FormData) {
  const parsed = wishlistMutationSchema.safeParse({
    productId: formValue(formData, "productId"),
    returnPath: formValue(formData, "returnPath"),
  });

  if (!parsed.success) {
    redirect("/wishlist?wishlistError=invalid-product");
  }

  await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_active_product_to_wishlist", {
    p_product_id: parsed.data.productId,
  });

  if (error) {
    redirect(
      appendError(parsed.data.returnPath, "wishlistError", "unavailable"),
    );
  }

  revalidatePath("/wishlist");
  revalidatePath(parsed.data.returnPath);
  redirect(parsed.data.returnPath);
}

export async function removeProductFromWishlistAction(formData: FormData) {
  const parsed = wishlistMutationSchema.safeParse({
    productId: formValue(formData, "productId"),
    returnPath: formValue(formData, "returnPath"),
  });

  if (!parsed.success) {
    redirect("/wishlist?wishlistError=invalid-product");
  }

  const user = await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (wishlist) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("wishlist_id", wishlist.id)
      .eq("product_id", parsed.data.productId);

    if (error) {
      redirect(
        appendError(parsed.data.returnPath, "wishlistError", "remove-failed"),
      );
    }
  }

  revalidatePath("/wishlist");
  revalidatePath(parsed.data.returnPath);
  redirect(parsed.data.returnPath);
}

export async function toggleWishlistAction(formData: FormData) {
  const parsed = wishlistMutationSchema.safeParse({
    productId: formValue(formData, "productId"),
    returnPath: formValue(formData, "returnPath"),
  });

  if (!parsed.success) {
    redirect("/wishlist?wishlistError=invalid-product");
  }

  const user = await requireActionUser(parsed.data.returnPath);
  const supabase = await createClient();
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (wishlist) {
    const { data: existing } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("wishlist_id", wishlist.id)
      .eq("product_id", parsed.data.productId)
      .maybeSingle();

    if (existing) {
      await removeProductFromWishlistAction(formData);
    }
  }

  await addProductToWishlistAction(formData);
}
