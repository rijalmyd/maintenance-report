/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { dueDateToThisYear } from "@/lib/utils";
import { UpdateChassisSchema } from "@/schema/chassisSchema";

import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const chassisId = Array.isArray(id) ? id[0] : id;

  try {
    switch (req.method) {
      case "GET": {
        const chassis = await findById(chassisId);
        if (!chassis) return res.status(404).json(fail("Chassis not found"));
        return res.status(200).json(success(chassis));
      }

      case "DELETE": {
        const chassis = await prisma.chassis.findUnique({
          where: { id: chassisId },
          select: { asset_id: true },
        });

        if (!chassis) {
          return res.status(404).json(fail("Chassis not found"));
        }

        await prisma.$transaction(async (tx) => {
          // 1️⃣ Hapus reminder
          await tx.reminder.deleteMany({
            where: { asset_id: chassis.asset_id },
          });

          // 2️⃣ Hapus chassis
          await tx.chassis.delete({
            where: { id: chassisId },
          });

          // 3️⃣ Hapus asset
          await tx.asset.delete({
            where: { id: chassis.asset_id },
          });
        });

        return res.status(200).json(success(null));
      }

      case "PATCH": {
        const chassis = await findById(chassisId);
        if (!chassis) return res.status(404).json(fail("Chassis not found"));

        const body = UpdateChassisSchema.parse(req.body);

        const updatedChassis = await prisma.chassis.update({
          where: { id: chassisId },
          data: {
            asset: {
              update: {
                asset_code: body.asset_code,
                is_active: body.is_active,
                asset_type: "CHASSIS",
                name: body.name,
                brand: body.brand,
                model: body.model,
                purchase_date: body.purchase_date,
                purchase_price: body.purchase_price,
                serrial_number: body.serial_number,
              },
            },
            owner: body.owner,
            address: body.address,
            color: body.color,
            chassis_number: body.chassis_number,
            chassis_type: body.chassis_type,
            axle_count: body.axle_count,
            chassis_category: body.chassis_category,
            kir_due_date: body.kir_due_date,
            no_kir: body.no_kir,
            notes: body.notes,
          },
          include: {
            asset: true,
          },
        });

        const assetId = updatedChassis.asset_id;

        // jika tidak ada, buat reminder baru dan jika ada, buat ulang dengan tanggal yang baru
        await prisma.reminder.deleteMany({
          where: { asset_id: assetId },
        });

        if (chassis.kir_due_date) {
          await prisma.reminder.create({
            data: {
              asset_id: updatedChassis.asset.id,
              reminder_type: "KIR",
              due_date: dueDateToThisYear(chassis.kir_due_date),
              interval_month: 6,
              next_due_date: dueDateToThisYear(chassis.kir_due_date),
            },
          });
        }

        return res.status(200).json(success(updatedChassis));
      }

      default:
        return res.status(405).json(fail("Method not allowed"));
    }
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

async function findById(id?: string) {
  if (!id) return null;
  return prisma.chassis.findUnique({ where: { id } });
}

export default verifyToken(handler);
