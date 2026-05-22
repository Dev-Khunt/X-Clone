import { z } from "zod";

export const registerSchema = z.object({
  display_name: z.string().min(2).max(100).trim(),

  username: z
    .string()
    .min(3, "Username too short")
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must be only letters, numbers, underscore",
    ),

  email: z.string().email("Invalid email format").toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be minimum 6 characters")
    .max(50)
    .regex(/[A-Z]/, "Password must contain uppercase")
    .regex(/[a-z]/, "Password must contain lowercase")
    .regex(/[0-9]/, "Passdword must contain number"),

    dob:z.coerce.date(),
    country: z.string().min(2, "Country is required")
});