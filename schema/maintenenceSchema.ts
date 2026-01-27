import z from "zod";

const SparepartItemSchema = z.object({
  id: z.string().uuid(), // id harus UUID
  quantity: z.number().int().min(0), // quantity integer >= 0
});

export const CreateMaintenenceSchma = z.object({
  asset_id: z.string(),
  driver_id: z.string().optional(),
  asset_image_url: z.string(),
  repair_image_urls: z.array(z.string()),
  km_asset: z.number().optional(),
  spareparts: z.array(SparepartItemSchema),
  done_by: z.string().optional(),
  complaint: z.string(),
  repair_plan: z.string(),
  location: z.string().optional(),
});

export const UpdateMaintenenceSchema = z.object({
  asset_id: z.string(),
  driver_id: z.string().optional(),
  asset_image_url: z.string(),
  repair_image_urls: z.array(z.string()),
  done_by: z.string().optional(),
  km_asset: z.number().optional(),
  spareparts: z.array(SparepartItemSchema),
  complaint: z.string(),
  repair_plan: z.string(),
  location: z.string().optional(),
});