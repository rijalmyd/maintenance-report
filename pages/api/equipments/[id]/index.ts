/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UpdateEquipmentSchema } from "@/schema/equipmentSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const equipmentId = Array.isArray(id) ? id[0] : id;

  try {
    switch (req.method) {
      case "GET": {
        const chassis = await findById(equipmentId);
        if (!chassis) return res.status(404).json(fail("Equipment not found"));
        return res.status(200).json(success(chassis));
      }

      case "DELETE": {
        const chassis = await findById(equipmentId);
        if (!chassis) return res.status(404).json(fail("Equipment not found"));

        await prisma.equipment.delete({ where: { id: equipmentId } });
        return res.status(200).json(success(null));
      }

      case "PATCH": {
        const chassis = await findById(equipmentId);
        if (!chassis) return res.status(404).json(fail("Equipment not found"));

        const body = UpdateEquipmentSchema.parse(req.body);
        const updatedChassis = await prisma.equipment.update({
          where: { id: equipmentId },
          data: {
            asset: {
              update: {
                asset_code: body.asset_code,
                is_active: body.is_active,
                asset_type: "EQUIPMENT",
                name: body.name,
                brand: body.brand,
                model: body.model,
                purchase_date: body.purchase_date,
                purchase_price: body.purchase_price,
                serrial_number: body.serial_number,
              },
            },
            condition: body.condition,
            equipment_code: body.equipment_code,
            equipment_type: body.equipment_type,
            specification: body.specification,
          },
          include: {
            asset: true,
          },
        });

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
  return prisma.equipment.findUnique({ where: { id } });
}

export default verifyToken(handler);
