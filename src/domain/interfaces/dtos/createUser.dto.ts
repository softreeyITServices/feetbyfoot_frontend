// domain/interfaces/dtos/auth.dto.ts
import { z } from "zod";

const indianPhoneRegex = /^(?:\+91)?\d{10}$/;

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(
      indianPhoneRegex,
      "Phone number must be 10 digits or in format +91XXXXXXXXXX",
    ),
  role: z.string().min(1, "Role is required"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Infer types from schemas
export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RefreshTokenData = z.infer<typeof RefreshTokenSchema>;
