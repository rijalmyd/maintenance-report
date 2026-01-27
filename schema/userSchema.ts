import z from "zod";

export const RegisterUserSchema = z.object({
  fullname: z.string().min(2, "fullname minimal 2 karakter"),
  username: z.string(),
  password: z.string().min(6, "password minimal 6 karakter"),
  role: z.enum(["ADMIN", "USER"]),
});

export const LoginUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum(["ADMIN", "USER"]),
});

export const UpdateUserSchema = z.object({
  fullname: z.string().min(2, "fullname minimal 2 karakter"),
  username: z.string(),
  role: z.enum(["ADMIN", "USER"]),
  is_active: z.boolean(),
}); 
