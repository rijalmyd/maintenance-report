/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/auth";
import { fail } from "@/lib/apiResponse";
import prisma from "@/lib/prisma";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json(fail("Method not allowed"));
    }

    const now = new Date();

    // Today (00:00 - 23:59)
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    // This month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      totalTodayMaintenances,
      totalThisMonthMaintenances,
      totalActiveUsers,
      totalSpareparts,
    ] = await Promise.all([
      // Total maintenance hari ini
      prisma.maintenence.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lt: endOfToday,
          },
        },
      }),

      // Total maintenance bulan ini
      prisma.maintenence.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      }),

      // Total user aktif (sesuaikan field jika beda)
      prisma.user.count({
        where: {
          is_active: true, // ⚠️ ganti jika schema kamu beda
        },
      }),

      // Total sparepart
      prisma.sparepart.count(),
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        total_today_maintenances: totalTodayMaintenances,
        total_this_month_maintenances: totalThisMonthMaintenances,
        total_active_users: totalActiveUsers,
        total_spareparts: totalSpareparts,
      },
    });
  } catch (error: any) {
    console.error("Dashboard summary error:", error);
    return res
      .status(500)
      .json(fail("Terjadi kesalahan server", error.message));
  }
}

export default verifyToken(handler);
