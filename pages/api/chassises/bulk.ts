/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { dueDateToThisYear, getNextGeneratedNumber } from "@/lib/utils";
import { CreateChassisBulkSchema, CreateChessisSchema } from "@/schema/chassisSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

const BulkCreateChassisSchema = z.array(CreateChassisBulkSchema);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json(fail("Method not allowed"));
  }

  try {
    const bodies = BulkCreateChassisSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const last = await tx.chassis.findFirst({
        orderBy: { asset: { asset_code: "desc" } },
        select: { asset: true },
      });

      let lastCode = last?.asset?.asset_code;
      const created: any[] = [];

      for (const body of bodies) {
        const nextCode = getNextGeneratedNumber(lastCode, {
          prefix: "CHS-",
          padLength: 7,
          maxNumber: 99999999,
        });

        const chassis = await tx.chassis.create({
          data: {
            asset: {
              create: {
                asset_code: nextCode,
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
            chassis_number: body.asset.name, // SERVER GENERATED
            chassis_category: body.chassis_category,
            chassis_type: body.chassis_type,
            axle_count: body.axle_count,
            no_kir: body.no_kir,
            kir_due_date: body.kir_due_date,
            notes: body.notes,
          },
          include: { asset: true },
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

        created.push(chassis);
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

    console.error("Bulk import error:", error);
    return res
      .status(500)
      .json(fail("Terjadi kesalahan server", error.message));
  }
}

export default verifyToken(handler);
