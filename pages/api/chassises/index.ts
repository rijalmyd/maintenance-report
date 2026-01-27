/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { dueDateToThisYear, getNextGeneratedNumber } from "@/lib/utils";
import { CreateChessisSchema } from "@/schema/chassisSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == "POST") {
    return handleCreateChassis(req, res);
  }

  if (req.method == "GET") {
    try {
      const drivers = await prisma.chassis.findMany({
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

async function handleCreateChassis(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = CreateChessisSchema.parse(req.body);

    const chassis = await prisma.$transaction(async (tx) => {
      const lastChassis = await tx.chassis.findFirst({
        orderBy: { asset: { asset_code: "desc" } },
        select: { asset: true },
      });

      const chassisNumber = getNextGeneratedNumber(
        lastChassis?.asset?.asset_code,
        {
          prefix: "CHS-",
          padLength: 7,
          maxNumber: 9999999,
        }
      );

      const chassis = await tx.chassis.create({
        data: {
          asset: {
            create: {
              asset_code: chassisNumber,
              is_active: true,
              asset_type: "CHASSIS",
              name: body.asset.name,
              brand: body.asset.brand,
              model: body.asset.model,
              purchase_date: body.asset.purchase_date,
              purchase_price: body.asset.purchase_price,
              serrial_number: body.asset.serial_number,
            },
          },
          owner: body.owner,
          address: body.address,
          color: body.color,
          chassis_number: body.asset.name,
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

      if (chassis.kir_due_date) {
        await tx.reminder.create({
          data: {
            asset_id: chassis.asset.id,
            reminder_type: "KIR",
            due_date: dueDateToThisYear(chassis.kir_due_date),
            interval_month: 6,
            next_due_date: dueDateToThisYear(chassis.kir_due_date),
          },
        });
      }

      return chassis;
    });

    return res.status(201).json(success(chassis));
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
