/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getNextGeneratedNumber } from "@/lib/utils";
import { CreateEquipementSchema } from "@/schema/equipmentSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET": {
        const equipments = await prisma.equipment.findMany({
          include: {
            asset: true,
          },
          orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(success(equipments));
      }
      case "POST": {
        return handleCreateEquipment(req, res);
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

async function handleCreateEquipment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = CreateEquipementSchema.parse(req.body);
    const equipment = await prisma.$transaction(async (tx) => {
      const lastEquipment = await tx.equipment.findFirst({
        orderBy: { asset: { asset_code: "desc" } },
        select: { asset: true },
      });

      const equipmentNumber = getNextGeneratedNumber(
        lastEquipment?.asset?.asset_code,
        {
          prefix: "EQP-",
          padLength: 7,
          maxNumber: 9999999,
        }
      );

      const equipment = await tx.equipment.create({
        data: {
          asset: {
            create: {
              asset_code: equipmentNumber,
              is_active: true,
              asset_type: "EQUIPMENT",
              name: body.asset.name,
              brand: body.asset.brand,
              model: body.asset.model,
              purchase_date: body.asset.purchase_date,
              purchase_price: body.asset.purchase_price,
              serrial_number: body.asset.serial_number,
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

      return equipment;
    });

    return res.status(201).json(success(equipment));
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
      .json(fail("terjadi kesalahan server", error.message));
  }
}

export default verifyToken(handler);
