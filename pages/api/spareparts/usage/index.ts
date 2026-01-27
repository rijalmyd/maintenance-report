/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

function getDefaultDateRange() {
  const now = new Date();

  const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // tgl 1 bulan ini
  const endDate = new Date(); // hari ini

  // set jam supaya aman
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        const { startDate, endDate } = req.query;

        // ✅ default bulan ini
        let dateRange = getDefaultDateRange();

        // ✅ override kalau query dikirim
        if (startDate && endDate) {
          dateRange = {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          };

          dateRange.startDate.setHours(0, 0, 0, 0);
          dateRange.endDate.setHours(23, 59, 59, 999);
        }

        // ✅ groupBy + filter tanggal
        const sparepartsRaw = await prisma.maintenenceSparepart.groupBy({
          by: ["sparepart_id"],
          where: {
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
          _sum: {
            total: true,
          },
          orderBy: {
            _sum: {
              total: "desc",
            },
          },
        });

        // ✅ ambil detail sparepart
        const result = await Promise.all(
          sparepartsRaw.map(async (item) => {
            const sparepart = await prisma.sparepart.findUnique({
              where: { id: item.sparepart_id },
              select: {
                id: true,
                name: true,
                unit: true,
                price: true,
              },
            });

            return {
              sparepart_id: item.sparepart_id,
              name: sparepart?.name ?? "-",
              unit: sparepart?.unit ?? "-",
              price: sparepart?.price ?? 0,
              total_used: item._sum.total ?? 0,
            };
          })
        );

        return res.status(201).json(success(result));
      }

      default:
        return res.status(405).json(fail("Method not allowed"));
    }
  } catch (error: any) {
    console.error("API error:", error);
    return res
      .status(500)
      .json(fail("Terjadi kesalahan server", error.message));
  }
}
