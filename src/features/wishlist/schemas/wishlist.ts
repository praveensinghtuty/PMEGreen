import { z } from "zod";

const returnPathSchema = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value.startsWith("/") && !value.startsWith("//"))
  .catch("/wishlist");

export const wishlistMutationSchema = z.object({
  productId: z.string().uuid(),
  returnPath: returnPathSchema,
});
