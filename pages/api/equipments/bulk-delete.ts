/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeleteEquipmentBulkSchema } from "@/schema/equipmentSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z, { treeifyError } from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json(fail("Method not allowed"));
  }

  try {
    const { ids } = DeleteEquipmentBulkSchema.parse(req.body);

    // OPTIONAL: pastikan semua equipment ada
    const existing = await prisma.equipment.count({
      where: { id: { in: ids } },
    });

    if (existing === 0) {
      return res.status(404).json(fail("Equipment not found"));
    }

    // ✅ SAMA dengan delete satuan → hanya delete equipment
    const deleted = await prisma.equipment.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return res.status(200).json(
      success({
        deletedCount: deleted.count,
      })
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: treeifyError(error),
      });
    }

    console.error("Bulk delete error:", error);
    return res
      .status(500)
      .json(fail("Terjadi kesalahan server", error.message));
  }
}

export default verifyToken(handler);
