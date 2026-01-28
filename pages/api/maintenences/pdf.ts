import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import puppeteer, { Browser } from "puppeteer";
import { generateVehicleHTML } from "@/lib/pdfGenerator";
import { generateChassisHTML } from "@/lib/pdfGenerator";
import { generateEquipmentHTML } from "@/lib/pdfGenerator";
import { fail } from "@/lib/apiResponse";
import jwt from "jsonwebtoken";

export const config = {
  api: {
    responseLimit: false, // MATIKAN LIMIT 4MB
    bodyParser: false,    // Opsional, biar hemat memori saat upload/download
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let browser: Browser | null = null;
  try {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "id is required" });

    const getMaintenance = await prisma.maintenence.findUnique({
      where: { id: id },
      include: {
        images: { include: { image: true } },
        asset: { include: { chassis: true, equipment: true, vehicle: true } },
        driver: true,
        spareparts: {
          include: {
            sparepart: true,
          },
        },
        user: true, // Asumsi user ini yang melakukan/approve
      },
    });

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json(fail("unauthorized"));
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      username: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    console.log("Generating PDF for maintenance ID:", id, "by user:", user);

    if (!getMaintenance) return res.status(404).json({ error: "data not found" });

    // Transform data images
    const result = {
      ...getMaintenance,
      images: getMaintenance?.images.map((pivot) => pivot.image) ?? [],
    };

    let html = "";

    switch (result.asset?.asset_type) {
      case "VEHICLE":
        html = generateVehicleHTML(result);
        break;

      case "CHASSIS":
        html = generateChassisHTML(result);
        break;

      case "EQUIPMENT":
        html = generateEquipmentHTML(result);
        break;

      default:
        html = "<h1>Type asset not supported</h1>";
    }

    // const browser = await puppeteer.launch({
    //   headless: true,
    //   // disable if running locally
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(120_000);
    page.setDefaultNavigationTimeout(120_000);

    // Set viewport untuk memastikan render CSS akurat
    await page.setViewport({ width: 794, height: 1123 }); // Ukuran A4 dalam px (96dpi)

    // await page.setRequestInterception(true);
    // page.on("request", (req) => {
    // const type = req.resourceType();
    //   if (["font", "media"].includes(type)) {
    //     req.abort();
    //   } else {
    //     req.continue();
    //   }
    // });

    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    const pdfBuffer = await page.pdf({
      format: "Legal",
      printBackground: true, // Penting agar warna background (kuning/abu) muncul
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });
    
    await page.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Laporan-${getMaintenance.id}.pdf"`
    );

    return res.end(pdfBuffer);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
