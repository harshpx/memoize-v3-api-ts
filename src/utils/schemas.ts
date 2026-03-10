import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3, "Identifier must be at least 3 characters long."),
  password: z.string().min(3, "Password must be at least 6 characters long."),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  verificationCode: z.string().length(6, "Verification code must be 6 characters long."),
  name: z.string().min(3, "Name must be at least 3 characters long."),
  username: z.string().min(3, "Username must be at least 3 characters long."),
  email: z.email("Invalid email address."),
  password: z.string().min(3, "Password must be at least 3 characters long."),
});

export type SignupRequest = z.infer<typeof signupSchema>;

export const emailSchema = z.object({
  email: z.email("Invalid email address."),
});

export type EmailRequest = z.infer<typeof emailSchema>;
