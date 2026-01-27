import z from "zod";

export const CreateAssetSchema = z.object({
  // asset,
  name: z.string().min(1, "Nama harus ada"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z
    .preprocess(
      (val) =>
        typeof val === "string" || val instanceof Date
          ? new Date(val)
          : undefined,
      z.date()
    )
    .optional(),
  purchase_price: z.number().optional(),
});
