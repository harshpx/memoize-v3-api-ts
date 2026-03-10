import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3, "Identifier must be at least 3 characters long."),
  password: z.string().min(3, "Password must be at least 6 characters long."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
