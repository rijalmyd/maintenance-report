/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UpdateSparepartSchema } from "@/schema/sparepartSchema";

import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const sparepartId = Array.isArray(id) ? id[0] : id;

  try {
    switch (req.method) {
      case "GET": {
        const sparepart = await findById(sparepartId);
        if (!sparepart)
          return res.status(404).json(fail("Sparepart not found"));
        return res.status(200).json(success(sparepart));
      }

      case "DELETE": {
        const sparepart = await prisma.sparepart.findUnique({
          where: { id: sparepartId },
        });

        if (!sparepart) {
          return res.status(404).json(fail("Sparepart not found"));
        }

        await prisma.$transaction([
          // ⬇️ DELETE CHILD TABLES FIRST
          prisma.maintenenceSparepart.deleteMany({
            where: {
              sparepart_id: sparepartId,
            },
          }),

          // ⬇️ DELETE SPAREPART
          prisma.sparepart.delete({
            where: {
              id: sparepartId,
            },
          }),
        ]);

        return res.status(200).json(success(null));
      }

      case "PATCH": {
        const sparepart = await findById(sparepartId);
        if (!sparepart)
          return res.status(404).json(fail("Sparepart not found"));

        const body = UpdateSparepartSchema.parse(req.body);
        const updatedSpatepart = await prisma.sparepart.update({
          where: { id: sparepartId },
          data: {
            code: body.code,
            name: body.name,
            price: body.price,
            stock_quantity: body.stock_quantity,
            unit: body.unit,
            description: body.description,
          },
        });

        return res.status(200).json(success(updatedSpatepart));
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
  return prisma.sparepart.findUnique({ where: { id } });
}

export default verifyToken(handler);
