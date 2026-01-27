/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getNextGeneratedNumber } from "@/lib/utils";
import { CreateDriverSchema } from "@/schema/driverSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z, { ZodError } from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return handleCreateDriver(req, res);
  }

  if (req.method === "GET") {
    try {
      const drivers = await prisma.driver.findMany({
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(success(drivers));
    } catch (error: any) {
      res.status(500).json(fail("terjadi kesalahan server", error.message));
    }
  }
}

async function handleCreateDriver(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = CreateDriverSchema.parse(req.body);

    const driver = await prisma.$transaction(async (tx) => {
      const lastDriver = await tx.driver.findFirst({
        orderBy: { driver_number: "desc" },
        select: { driver_number: true },
      });

      const driverNumber = getNextGeneratedNumber(
        lastDriver?.driver_number,
        {
          prefix: "DR-",
          padLength: 7,
          maxNumber: 9999999,
        }
      );

      return tx.driver.create({
        data: {
          driver_number: driverNumber,
          name: body.name,
          phone: body.phone,
          notes: body.notes,
          sim_due_date: body.sim_due_date,
          is_active: true,
        },
      });
    });

    return res.status(201).json(success(driver));
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: error.flatten().fieldErrors,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json(fail(error.message));
    }

    return res.status(500).json(fail("Terjadi kesalahan server"));
  }
}


export default verifyToken(handler);
