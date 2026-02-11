import { z } from "zod";

export const SendOtpSchema = z.object({
  identifier: z.string().min(1),
  type: z.enum(["email", "phone"]),
});
