import { z } from "zod";

export const paymentMethodSchema = z.enum(["cod", "upi"]);

export const checkoutSubmissionSchema = z
  .object({
    addressId: z.string().uuid(),
    customerNotes: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((value) => (value ? value : null)),
    idempotencyKey: z.string().trim().min(16).max(120),
    paymentMethod: paymentMethodSchema,
    upiReference: z
      .string()
      .trim()
      .max(80)
      .optional()
      .transform((value) => (value ? value : null)),
  })
  .superRefine((value, context) => {
    if (
      value.paymentMethod === "upi" &&
      (!value.upiReference || value.upiReference.length < 6)
    ) {
      context.addIssue({
        code: "custom",
        message: "Enter the UPI transaction reference",
        path: ["upiReference"],
      });
    }
  });

export type CheckoutSubmissionInput = z.infer<typeof checkoutSubmissionSchema>;
