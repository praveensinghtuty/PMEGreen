import { z } from "zod";

const uuidSchema = z.string().uuid();
const returnPathSchema = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value.startsWith("/") && !value.startsWith("//"))
  .catch("/cart");

export const cartAddSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99).catch(1),
  returnPath: returnPathSchema,
  variantId: uuidSchema,
});

export const cartItemQuantitySchema = z.object({
  itemId: uuidSchema,
  quantity: z.coerce.number().int().min(1).max(99),
  returnPath: returnPathSchema,
});

export const cartItemMutationSchema = z.object({
  itemId: uuidSchema,
  returnPath: returnPathSchema,
});

export const cartReturnPathSchema = z.object({
  returnPath: returnPathSchema,
});

export type CartActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialCartActionState: CartActionState = {
  status: "idle",
  message: null,
};
