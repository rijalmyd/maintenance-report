/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const maintenenceId = Array.isArray(id) ? id[0] : id;

  try {
    switch (req.method) {
      case "GET": {
        const maintenence = await findById(maintenenceId);
        if (!maintenence)
          return res.status(404).json(fail("Maintenence not found"));

        // transform data agar images tidak berisi pivot
        const result = {
          ...maintenence,
          images: maintenence?.images.map((pivot) => pivot.image) ?? [],
          spareparts:
            maintenence?.spareparts.map((pivot) => pivot.sparepart) ?? [],
        };

        return res.status(201).json(success(result));
      }

      case "DELETE": {
        if (!maintenenceId)
          return res.status(400).json(fail("Invalid maintenence ID"));

        const maintenence = await prisma.maintenence.findUnique({
          where: { id: maintenenceId },
          include: {
            images: true,
          },
        });

        if (!maintenence)
          return res.status(404).json(fail("Maintenence not found"));

        await prisma.$transaction(async (tx) => {
          // 1️⃣ delete maintenence_sparepart
          await tx.maintenenceSparepart.deleteMany({
            where: { maintenence_id: maintenenceId },
          });

          // 2️⃣ delete maintenence_image
          await tx.maintenenceImage.deleteMany({
            where: { maintenence_id: maintenenceId },
          });

          // 3️⃣ delete actual image records (THIS IS WHAT YOU MISSED)
          await tx.image.deleteMany({
            where: {
              id: {
                in: maintenence.images.map((img) => img.image_id),
              },
            },
          });

          // 4️⃣ finally delete maintenence
          await tx.maintenence.delete({
            where: { id: maintenenceId },
          });
        });

        return res.status(200).json(success(null));
      }



      // case "PATCH": {
      //   const maintenence = await findById(maintenenceId);
      //   if (!maintenence)
      //     return res.status(404).json(fail("Maintenence not found"));

      //   const body = UpdateEquipementSchema.parse(req.body);
      //   const updatedMaintenence = await prisma.maintenence.update({
      //     where: { id: maintenenceId },
      //     data: {
      //       asset_image_url: body.asset_image_url,
      //       complaint: body.complaint,
      //       km_asset: body.km_asset,
      //       labor_cost: laborCost,
      //       record_number: "MTC-001",
      //       repair_notes: body.repair_plan,
      //       spareparts_cost: sparepartCost,
      //       total_cost: totalCost,
      //       asset_id: body.asset_id,
      //       driver_id: body.driver_id,
      //       user_id: decoded.id,
      //     },
      //     include: {
      //       asset: true,
      //     },
      //   });

      //   return res.status(200).json(success(updatedMaintenence));
      // }

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
  return prisma.maintenence.findUnique({
    where: { id },
    include: {
      asset: {
        include: {
          chassis: true,
          equipment: true,
          vehicle: true,
        },
      },
      driver: true,
      images: {
        include: {
          image: true,
        },
      },
      spareparts: {
        include: {
          sparepart: true,
        },
      },
      user: true,
    },
  });
}

export default verifyToken(handler);
