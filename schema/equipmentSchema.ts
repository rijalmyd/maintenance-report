import z from "zod";
import { CreateAssetSchema } from "./assetSchema";
import { is } from "date-fns/locale";

export const CreateEquipementSchema = z.object({
  // asset
  asset: CreateAssetSchema,

  // vehicle
  equipment_code: z.string(),
  equipment_type: z.string(),
  specification: z.string(),
  condition: z.string(),
});

export const UpdateEquipmentSchema = z.object({
  // asset
  asset_code: z.string(),
  name: z.string(),
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
  is_active: z.boolean().optional(),
  purchase_price: z.number().optional(),
  // vehicle
  equipment_code: z.string(),
  equipment_type: z.string(),
  specification: z.string(),
  condition: z.string(),
});

export const DeleteEquipmentBulkSchema = z.object({
  ids: z.array(z.uuid()),
});
