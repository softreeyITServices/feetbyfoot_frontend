import { z } from "zod";

export const VerifyOtpSchema = z.object({
  identifier: z.string().min(1),
  type: z.enum(["email", "phone"]),
  otp: z.string().min(1),
});
