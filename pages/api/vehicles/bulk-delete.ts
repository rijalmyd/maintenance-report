/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeleteVehicleBulkSchema } from "@/schema/vehicleSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json(fail("Method not allowed"));
  }

  try {
    const { ids } = DeleteVehicleBulkSchema.parse(req.body);

    // Pastikan ada vehicle
    const vehicles = await prisma.vehicle.findMany({
      where: { id: { in: ids } },
      select: { id: true, asset_id: true },
    });

    if (vehicles.length === 0) {
      return res.status(404).json(fail("Vehicles not found"));
    }

    await prisma.$transaction(async (tx) => {
      for (const vehicle of vehicles) {
        // 1️⃣ Hapus reminder terkait asset
        await tx.reminder.deleteMany({
          where: { asset_id: vehicle.asset_id },
        });

        // 2️⃣ Hapus vehicle
        await tx.vehicle.delete({
          where: { id: vehicle.id },
        });

        // 3️⃣ Hapus asset
        await tx.asset.delete({
          where: { id: vehicle.asset_id },
        });
      }
    });

    return res.status(200).json(
      success({
        deletedCount: vehicles.length,
      })
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error("Bulk delete error:", error);
    return res
      .status(500)
      .json(fail("Terjadi kesalahan server", error.message));
  }
}

export default verifyToken(handler);
