/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@/generated/prisma/client";
import { fail, success } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";
import { generateMaintenenceId } from "@/lib/maintenanceRecordNumberGenerator";
import prisma from "@/lib/prisma"
import { CreateMaintenenceSchma } from "@/schema/maintenenceSchema";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET": {
        const {
          page = 1,
          size = 10,
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
          AND: [searchFilter, dateFilter],
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
      case "POST": {
        return handleCreateMaintenance(req, res);
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

async function handleCreateMaintenance(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json(fail("unauthorized"));

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    id: string;
    username: string;
  };

  const body = CreateMaintenenceSchma.parse(req.body);

  const result = await prisma.$transaction(async (tx) => {
    const laborCost = 0;
    let sparepartCost = 0;

    const driver = body.driver_id
      ? await tx.driver.findUnique({
          where: { id: body.driver_id },
        })
      : null;

    for (const sparepartInput of body.spareparts) {
      const sparepart = await tx.sparepart.findUnique({
        where: { id: sparepartInput.id },
      });

      if (!sparepart) throw new Error("sparepart not found");

      sparepartCost += sparepart.price * sparepartInput.quantity;
    }

    const totalCost = sparepartCost + laborCost;

    const images = await Promise.all(
      body.repair_image_urls.map((url) =>
        tx.image.create({ data: { url } })
      )
    );

    const lastID = await tx.maintenence.findFirst({
      orderBy: { createdAt: "desc" },
      select: { record_number: true },
    });

    const generatedID = generateMaintenenceId(lastID);

    const maintenence = await tx.maintenence.create({
      data: {
        asset_image_url: body.asset_image_url,
        complaint: body.complaint,
        km_asset: body.km_asset,
        labor_cost: laborCost,
        record_number: generatedID,
        repair_notes: body.repair_plan,
        spareparts_cost: sparepartCost,
        done_by: body.done_by ?? null,
        total_cost: totalCost,
        asset_id: body.asset_id,
        driver_id: driver?.id ?? null,
        user_id: decoded.id,
        location: body.location ?? null,
      },
    });

    await tx.maintenenceSparepart.createMany({
      data: body.spareparts.map((sp) => ({
        maintenence_id: maintenence.id,
        sparepart_id: sp.id,
        total: sp.quantity,
      })),
    });

    await tx.maintenenceImage.createMany({
      data: images.map((img) => ({
        maintenence_id: maintenence.id,
        image_id: img.id,
      })),
    });

    return tx.maintenence.findUnique({
      where: { id: maintenence.id },
      include: {
        images: { include: { image: true } },
        asset: {
          include: { chassis: true, equipment: true, vehicle: true },
        },
        driver: true,
        spareparts: { include: { sparepart: true } },
        user: true,
      },
    });
  });

  return res.status(201).json(
    success({
      ...result,
      images: result?.images.map((p) => p.image) ?? [],
    })
  );
}

export default verifyToken(handler);
