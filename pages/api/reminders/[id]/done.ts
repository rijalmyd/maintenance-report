// pages/api/reminders/[id]/done.ts
import { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import dayjs from "dayjs"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" })

  const { id } = req.query

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid reminder id"
    })
  }

  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id }
    })

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      })
    }

    const nextDueDate = dayjs(reminder.next_due_date)
      .add(reminder.interval_month, "month")
      .toDate()

    const updated = await prisma.reminder.update({
      where: { id },
      data: {
        last_done_at: new Date(),
        next_due_date: nextDueDate
      }
    })

    return res.status(200).json({
      success: true,
      message: "Reminder marked as done",
      data: updated
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to update reminder"
    })
  }
}
