import { z } from "zod";

export const TAMIL_NADU_STATE = "Tamil Nadu";

const textField = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .max(max, `Must be ${max} characters or fewer`);

const optionalTextField = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .transform((value) => (value ? value : null));

export const addressMutationSchema = z.object({
  addressLine1: textField(160),
  addressLine2: optionalTextField(160),
  city: textField(80),
  district: textField(80),
  fullName: textField(100),
  id: z.string().uuid().optional(),
  isDefault: z.boolean().catch(false),
  label: textField(40),
  landmark: optionalTextField(120),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number"),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, "Enter a valid 6-digit postal code"),
  returnPath: z
    .string()
    .trim()
    .regex(/^\/[A-Za-z0-9/?=&._%-]*$/)
    .catch("/addresses"),
  state: z
    .string()
    .trim()
    .transform(() => TAMIL_NADU_STATE),
});

export const addressIdSchema = z.object({
  id: z.string().uuid(),
  returnPath: z
    .string()
    .trim()
    .regex(/^\/[A-Za-z0-9/?=&._%-]*$/)
    .catch("/addresses"),
});

export type AddressMutationInput = z.infer<typeof addressMutationSchema>;
