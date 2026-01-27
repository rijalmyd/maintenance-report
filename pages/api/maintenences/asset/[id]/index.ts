/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@/generated/prisma/client";
import { fail, success } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        const { id } = req.query;
        const assetIdString = Array.isArray(id) ? id[0] : id;

        const {
          page = 1,
          size = 1000,
          search = "",
          startDate,
          endDate,
        } = req.query;

        const skip = (Number(page) - 1) * Number(size);
        const take = Number(size);

        const searchFilter: Prisma.MaintenenceWhereInput = search
          ? {
              OR: [
                {
                  record_number: {
                    contains: search as string,
                  },
                },
                {
                  complaint: {
                    contains: search as string,
                  },
                },
                {
                  repair_notes: {
                    contains: search as string,
                  },
                },
                {
                  asset: {
                    name: { contains: search as string },
                  },
                },
                {
                  driver: {
                    name: { contains: search as string },
                  },
                },
              ],
            }
          : {};

        // Build filter untuk tanggal created_at
        let dateFilter: Prisma.MaintenenceWhereInput = {};

        if (startDate && endDate) {
          dateFilter = {
            createdAt: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          };
        } else if (startDate) {
          // hanya start date
          dateFilter = {
            createdAt: {
              gte: new Date(startDate as string),
            },
          };
        } else if (endDate) {
          // hanya end date
          dateFilter = {
            createdAt: {
              lte: new Date(endDate as string),
            },
          };
        }

        // gabungkan semua filter
        const where: Prisma.MaintenenceWhereInput = {
          AND: [searchFilter, dateFilter, { asset_id: assetIdString }],
        };

        // Hitung total untuk pagination
        const total = await prisma.maintenence.count({ where });

        const maintenences = await prisma.maintenence.findMany({
          where,
          skip,
          take,
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
          orderBy: { createdAt: "desc" },
        });

        // transform data agar images tidak berisi pivot
        const formatted = maintenences.map((m) => ({
          ...m,
          images: m.images?.map((pivot) => pivot.image), // ambil langsung objek image-nya
          // spareparts: m.spareparts?.map((pivot) => pivot.sparepart),
        }));

        return res.status(200).json({
          success: true,
          message: success,
          data: formatted,
          pagging: {
            total,
            page: Number(page),
            size: Number(size),
            totalPages: Math.ceil(total / Number(size)),
          },
        });
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
