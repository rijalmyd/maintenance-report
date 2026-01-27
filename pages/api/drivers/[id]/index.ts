/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UpdateDriverSchema } from "@/schema/driverSchema";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idStr = Array.isArray(id) ? id[0] : id;

  if (req.method === "PATCH") {
    try {
      const body = UpdateDriverSchema.parse(req.body);

      const user = await prisma.driver.update({
        where: {
          id: idStr,
        },
        data: body,
      });

      res.status(200).json(success(user));
    } catch (error: any) {
      console.log("Error updating driver:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors: error.flatten().fieldErrors,
        });
      }
      console.log(error);
      res.status(500).json(fail("terjadi kesalahan server"));
    }
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.driver.findUnique({
        where: { id: idStr },
      });

      res.status(200).json(success(user));
    } catch (error: any) {
      res.status(500).json(fail("terjadi kesalahan server", error.message));
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.driver.delete({
        where: { id: idStr },
      });

      res.status(200).json(success(null));
    } catch (error: any) {
      res.status(500).json(fail("terjadi kesalahan server", error.message));
    }
  }
}

export default verifyToken(handler);
