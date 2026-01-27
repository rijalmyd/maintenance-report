// pages/api/reminders/index.ts
import { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import dayjs from "dayjs"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const {
      startDate,
      endDate,
      type,
      assetType,
      overdue,
      sort = "asc"
    } = req.query

    const today = dayjs().startOf("day")

    const where: any = {
      is_active: true
    }

    if (overdue === "true") {
      where.next_due_date = {
        lt: today.toDate()
      }
    }

    if (startDate && endDate) {
      where.next_due_date = {
        gte: dayjs(startDate as string).startOf("day").toDate(),
        lte: dayjs(endDate as string).endOf("day").toDate()
      }
    }

    if (type) {
      where.reminder_type = type
    }

    if (assetType) {
      where.asset = {
        asset_type: assetType
      }
    }

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        asset: {
          include: {
            vehicle: true,
            chassis: true
          }
        }
      },
      orderBy: {
        next_due_date: sort === "desc" ? "desc" : "asc"
      }
    })

    return res.status(200).json({
      success: true,
      total: reminders.length,
      data: reminders
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to get reminders"
    })
  }
}