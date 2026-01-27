import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type GeneratedNumberOptions = {
  prefix: string;
  padLength: number;
  maxNumber: number;
};

export function getNextGeneratedNumber(
  last: string | undefined,
  { prefix, padLength, maxNumber }: GeneratedNumberOptions
): string {
  const lastNumber = last
    ? Number(last.replace(prefix, ""))
    : 0;

  if (!Number.isInteger(lastNumber)) {
    throw new Error("Invalid generated number format");
  }

  if (lastNumber >= maxNumber) {
    throw new Error("Generated number limit reached");
  }

  return `${prefix}${String(lastNumber + 1).padStart(padLength, "0")}`;
}

export async function imageUrlToBase64(url: string) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 15000,
  });

  const contentType = response.headers["content-type"];
  const base64 = Buffer.from(response.data).toString("base64");

  return `data:${contentType};base64,${base64}`;
}


// utils/assetExcelMapper.ts
export const HEADER_MAP_CHASSIS: Record<string, string> = {
  "NAMA CHASSIS": "chassis_name",
  "PEMILIK": "owner",
  "ALAMAT": "address",
  "MERK": "brand",
  "MODEL": "model",
  "JENIS CHASSIS": "chassis_type",
  "TIPE CHASSIS": "frame_type",
  "JUMLAH EXCEL": "axle_count",
  "TAHUN": "year",
  "TAHUN ASSEMBLY": "assembly_year",
  "CILINDER": "cylinder",
  "WARNA": "color",
  "NO RANGKA": "chassis_number",
  "NO MESIN": "engine_number",
  "NO BPKB": "bpkb_number",
  "BAHAN BAKAR": "fuel_type",
  "NO STNK": "stnk_number",
  "TGL STNK": "stnk_date",
  "TGL JTH TEMPO STNK": "stnk_expired",
  "KODE SUPIR": "driver_code",
  "TGL KIR": "kir_due_date",
  "NO KIR CHASSIS": "kir_number",
};

export const HEADER_MAP_VEHICLE: Record<string, string> = {
  "NO POL": "license_plate",
  "PEMILIK": "owner",
  "ALAMAT": "address",
  "MERK": "brand",
  "MODEL": "model",
  "TAHUN": "year",
  "TAHUN ASSEMBLY": "assembly_year",
  "CILINDER": "cylinder",
  "WARNA": "color",
  "NO RANGKA": "chassis_number",
  "NO MESIN": "engine_number",
  "NO BPKB": "bpkb_number",
  "BAHAN BAKAR": "fuel_type",
  "NO STNK": "stnk_number",
  "TGL STNK": "stnk_date",
  "TGL JTH TEMPO STNK": "stnk_due_date",
  "KODE SUPIR": "driver_code",
  "TGL KIR": "kir_due_date",
  "NO KIR CHASSIS": "kir_number",
};

export function dueDateToThisYear(input: Date) {
  if (!input) return input;

  const inputDate = new Date(input);
  const now = new Date();

  return new Date(
    now.getFullYear(),          // tahun ini
    inputDate.getMonth(),       // bulan dari input
    inputDate.getDate()         // tanggal dari input
  );
}
