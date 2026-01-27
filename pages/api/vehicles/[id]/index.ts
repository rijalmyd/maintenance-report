/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { dueDateToThisYear } from "@/lib/utils";
import { UpdateVehicleSchema } from "@/schema/vehicleSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idStr = Array.isArray(id) ? id[0] : id;

  if (req.method === "GET") {
    try {
      const user = await prisma.vehicle.findUnique({
        where: { id: idStr },
        include: {
          asset: true,
        },
      });

      res.status(200).json(success(user));
    } catch (error: any) {
      res.status(500).json(fail("terjadi kesalahan server", error.message));
    }
  }
  if (req.method === "PATCH") {
    try {
      const body = UpdateVehicleSchema.parse(req.body);

      const vehicle = await prisma.vehicle.update({
        where: {
          id: idStr,
        },
        data: {
          asset: {
            update: {
              asset_code: body.asset_code,
              is_active: body.is_active,
              asset_type: "VEHICLE",
              name: body.name,
              brand: body.brand,
              model: body.model,
              purchase_date: body.purchase_date,
              purchase_price: body.purchase_price,
              serrial_number: body.serial_number,
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

      const assetId = vehicle.asset_id;

      // jika tidak ada, buat reminder baru dan jika ada, buat ulang dengan tanggal yang baru
      await prisma.reminder.deleteMany({
        where: { asset_id: assetId },
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
        await prisma.reminder.createMany({
          data: remindersData,
        });
      }

      // if (existingReminders.length === 0) {
      //   const remindersData: {
      //     asset_id: string;
      //     reminder_type: "STNK" | "KIR";
      //     due_date: Date;
      //     interval_month: number;
      //     next_due_date: Date;
      //   }[] = [];

      //   if (body.stnk_due_date) {
      //     remindersData.push({
      //       asset_id: assetId,
      //       reminder_type: "STNK",
      //       due_date: body.stnk_due_date,
      //       interval_month: 12,
      //       next_due_date: body.stnk_due_date,
      //     });
      //   }

      //   if (body.kir_due_date) {
      //     remindersData.push({
      //       asset_id: assetId,
      //       reminder_type: "KIR",
      //       due_date: body.kir_due_date,
      //       interval_month: 6,
      //       next_due_date: body.kir_due_date,
      //     });
      //   }

      //   if (remindersData.length > 0) {
      //     await prisma.reminder.createMany({
      //       data: remindersData,
      //     });
      //   }
      // }

      res.status(200).json(success(vehicle));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors: error.flatten().fieldErrors,
        });
      }
      console.log(error);
      res.status(500).json(fail("terjadi kesalahan server"));
    }
  }
  if (req.method === "DELETE") {
    try {
      // Ambil asset_id vehicle
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: idStr },
        select: { asset_id: true },
      });

      if (!vehicle) return res.status(404).json(fail("Vehicle not found"));

      await prisma.$transaction(async (tx) => {
        // 1️⃣ Hapus reminder terkait asset
        await tx.reminder.deleteMany({
          where: { asset_id: vehicle.asset_id },
        });

        // 2️⃣ Hapus vehicle
        await tx.vehicle.delete({
          where: { id: idStr },
        });

        // 3️⃣ Hapus asset
        await tx.asset.delete({
          where: { id: vehicle.asset_id },
        });
      });

      res.status(200).json(success(null));
    } catch (error: any) {
      console.error(error);
      res.status(500).json(fail("Terjadi kesalahan server", error.message));
    }
  }
}

export default verifyToken(handler);
