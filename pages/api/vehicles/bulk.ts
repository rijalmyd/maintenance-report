/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { dueDateToThisYear, getNextGeneratedNumber } from "@/lib/utils";
import { CreateVehicleSchema } from "@/schema/vehicleSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

const BulkCreateVehicleSchema = z.array(CreateVehicleSchema);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("REQ BODY", req.body);
  if (req.method !== "POST") {
    return res.status(405).json(fail("Method not allowed"));
  }

  try {
    const bodies = BulkCreateVehicleSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const last = await tx.vehicle.findFirst({
        orderBy: { asset: { asset_code: "desc" } },
        select: { asset: true },
      });

      let lastCode = last?.asset?.asset_code;
      const created: any[] = [];

      for (const body of bodies) {
        const nextCode = getNextGeneratedNumber(lastCode, {
          prefix: "TRK-",
          padLength: 7,
          maxNumber: 99999999,
        });

        const vehicle = await tx.vehicle.create({
          data: {
            asset: {
              create: {
                asset_code: nextCode,
                is_active: true,
                asset_type: "VEHICLE",
                name: body.asset.name, // biasanya NO POL
                brand: body.asset.brand,
                model: body.asset.model,
                purchase_date: body.asset.purchase_date,
                purchase_price: body.asset.purchase_price,
                serrial_number: body.asset.serial_number, // NO RANGKA
              },
            },

            license_plate: body.license_plate,
            owner: body.owner,
            address: body.address,
            color: body.color,
            // vehicle_type: body.vehicle_type,
            year: body.year,
            engine_number: body.engine_number,
            frame_number: body.frame_number,
            no_kir: body.no_kir,
            kir_due_date: body.kir_due_date,
            stnk_due_date: body.stnk_due_date,
            stnk_number: body.stnk_number,
            notes: body.notes,
          },
          include: { asset: true },
        });

        const remindersData: {
          asset_id: string;
          reminder_type: "STNK" | "KIR";
          due_date: Date;
          interval_month: number;
          next_due_date: Date;
        }[] = [];

        if (vehicle.stnk_due_date) {
          remindersData.push({
            asset_id: vehicle.asset.id,
            reminder_type: "STNK",
            due_date: dueDateToThisYear(vehicle.stnk_due_date),
            interval_month: 12,
            next_due_date: dueDateToThisYear(vehicle.stnk_due_date)
          });
        }

        if (vehicle.kir_due_date) {
          remindersData.push({
            asset_id: vehicle.asset.id,
            reminder_type: "KIR",
            due_date: dueDateToThisYear(vehicle.kir_due_date),
            interval_month: 6,
            next_due_date: dueDateToThisYear(vehicle.kir_due_date),
          });
        }

        if (remindersData.length > 0) {
          await tx.reminder.createMany({
            data: remindersData,
          });
        }

        created.push(vehicle);
        lastCode = nextCode;
      }

      return created;
    });

    return res.status(201).json(success(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: z.treeifyError(error),
      });
    }

    console.error("Bulk import vehicle error:", error);
    return res
      .status(500)
      .json(fail("Terjadi kesalahan server", error.message));
  }
}

export default verifyToken(handler);
