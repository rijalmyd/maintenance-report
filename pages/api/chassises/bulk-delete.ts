/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeleteChassisBulkSchema } from "@/schema/chassisSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json(fail("Method not allowed"));
  }

  try {
    const { ids } = DeleteChassisBulkSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Ambil asset_id dari chassis
      const chassisList = await tx.chassis.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          asset_id: true,
        },
      });

      if (chassisList.length === 0) {
        throw new Error("Chassis not found");
      }

      const assetIds = chassisList.map((c) => c.asset_id);

      // 2️⃣ Hapus reminder berdasarkan asset
      await tx.reminder.deleteMany({
        where: {
          asset_id: { in: assetIds },
        },
      });

      // 3️⃣ Hapus chassis
      const deletedChassis = await tx.chassis.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      return {
        deletedChassis: deletedChassis.count,
        deletedAssets: assetIds.length,
        deletedReminders: true,
      };
    });

    return res.status(200).json(success(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: error.flatten().fieldErrors,
      });
    }

    if (error.message === "Chassis not found") {
      return res.status(404).json(fail("Chassis not found"));
    }

    console.error("Bulk delete error:", error);
    return res
      .status(500)
      .json(fail("Terjadi kesalahan server", error.message));
  }
}

export default verifyToken(handler);
