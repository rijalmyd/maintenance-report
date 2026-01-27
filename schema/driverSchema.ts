import z from "zod";

export const CreateDriverSchema = z.object({
  name: z.string(),
  phone: z.string(),
  notes: z.string().optional(),
  sim_due_date: z.preprocess(
        (val) =>
          typeof val === "string" || val instanceof Date
            ? new Date(val)
            : undefined,
        z.date()
      )
      .optional(),
});

export const UpdateDriverSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  sim_due_date: z.preprocess(
        (val) =>
          typeof val === "string" || val instanceof Date
            ? new Date(val)
            : undefined,
        z.date()
      )
      .optional(),
  is_active: z.boolean().optional(),
});
