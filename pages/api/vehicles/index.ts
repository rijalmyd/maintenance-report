/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { dueDateToThisYear, getNextGeneratedNumber } from "@/lib/utils";
import { CreateVehicleSchema } from "@/schema/vehicleSchema";
import { tr } from "date-fns/locale";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return handleCreateVehicle(req, res);
  }

  if (req.method === "GET") {
    try {
      const drivers = await prisma.vehicle.findMany({
        include: {
          asset: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(success(drivers));
    } catch (error: any) {
      res.status(500).json(fail("terjadi kesalahan server", error.message));
    }
  }
}

async function handleCreateVehicle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = CreateVehicleSchema.parse(req.body);

    const vehicle = await prisma.$transaction(async (tx) => {
      const lastVehicle = await tx.vehicle.findFirst({
        orderBy: { asset: { asset_code: "desc" } },
        select: { asset: true },
      });

      const vehicleNumber = getNextGeneratedNumber(
        lastVehicle?.asset?.asset_code,
        {
          prefix: "TRK-",
          padLength: 8,
          maxNumber: 99999999,
        }
      );
      const vehicle = await tx.vehicle.create({
        data: {
          asset: {
            create: {
              asset_code: vehicleNumber,
              is_active: true,
              asset_type: "VEHICLE",
              name: body.asset.name,
              brand: body.asset.brand,
              model: body.asset.model,
              purchase_date: body.asset.purchase_date,
              purchase_price: body.asset.purchase_price,
              serrial_number: body.asset.serial_number,
            },
          },
          color: body.color,
          engine_number: body.engine_number,
          frame_number: body.frame_number,
          kir_due_date: body.kir_due_date,
          license_plate: body.license_plate,
          no_kir: body.no_kir,
          stnk_due_date: body.stnk_due_date,
          year: body.year,
          notes: body.notes,
        },
        include: {
          asset: true,
        },
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

      return vehicle;
    });

    return res.status(201).json(success(vehicle));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error("API error:", error);
    return res
      .status(500)
      .json(fail("Terjadi kesalahan server", error.message));
  }
}

export default verifyToken(handler);
