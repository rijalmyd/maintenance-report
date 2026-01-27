import { z } from "zod";

export const ReminderTypeEnum = z.enum(["KIR", "STNK"]);
export const AssetTypeEnum = z.enum(["VEHICLE", "CHASSIS"]);

export const ReminderSchema = z.object({
  id: z.string(),
  reminder_type: ReminderTypeEnum,
  next_due_date: z.string(),
  last_done_at: z.string().nullable().optional(),
  asset: z.object({
    id: z.string(),
    asset_type: AssetTypeEnum,
    name: z.string(),
    vehicle: z
      .object({
        license_plate: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    chassis: z
      .object({
        chassis_number: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  }),
});

export const ReminderListSchema = z.array(ReminderSchema);

export type Reminder = z.infer<typeof ReminderSchema>;
