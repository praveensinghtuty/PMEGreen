import { z } from "zod";

export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Use E.164 format, for example +919876543210");

export const otpTokenSchema = z
  .string()
  .trim()
  .regex(/^\d{4,8}$/, "Enter the OTP code from the SMS");
