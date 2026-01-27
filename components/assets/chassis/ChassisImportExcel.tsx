"use client";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { HEADER_MAP_CHASSIS } from "@/lib/utils";
import { formatDate, formatDateID } from "@/lib/formatDate";
import { FileSpreadsheetIcon, Import, ImportIcon, LucideImport, Plus, PlusCircle } from "lucide-react";
import Document from "next/document";

function excelDateToISO(value: any) {
  if (!value) return null;
  if (typeof value === "number") {
    return new Date((value - 25569) * 86400 * 1000).toISOString();
  }
  return value;
}

export default function ChassisImportExcel({
  onImported,
}: {
  onImported: (data: any[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const raw = XLSX.utils.sheet_to_json<any[]>(ws, {
        header: 1,
        defval: "",
      });

      const headers = raw[0];
      const rows = raw.slice(1);

      // const mapped = rows.map((row) => {
      //   const obj: any = {};

      //   headers.forEach((header: string, idx: number) => {
      //     const key = HEADER_MAP[header?.trim()];
      //     if (!key) return;

      //     let value = row[idx];

      //     if (key.includes("date")) {
      //       value = excelDateToISO(value);
      //     }

      //     if (key === "axle_count" || key === "year") {
      //       value = Number(value) || 0;
      //     }

      //     obj[key] = value || null;
      //   });

      //   return obj;
      // });
      const mapped = rows.map((row) => {
        const temp: any = {};

        headers.forEach((header: string, idx: number) => {
          const key = HEADER_MAP_CHASSIS[header?.trim()];
          if (!key) return;

          let value = row[idx];

          if (key.includes("date")) {
            value = excelDateToISO(value);
          }

          if (key === "axle_count") {
            value = Number(value) || 0;
          }

          temp[key] = value || null;
        });

        const purchase_date = (() => {
          if (!temp.year) return undefined;

          // jika hanya tahun (2020)
          if (/^\d{4}$/.test(String(temp.year))) {
            return formatDate(new Date(Number(temp.year), 0, 1));
          }

          // jika full date (10/12/2020 atau ISO)
          return temp.year 
            ? excelDateToISO(temp.year)
            : undefined;
        })();
        
        return {
          asset: {
            name: temp.chassis_name,
            brand: temp.brand || "",
            model: temp.model || "",
            purchase_date: purchase_date,
            purchase_price: temp.purchase_price || 0,
            serial_number: temp.chassis_number || "",
          },
          owner: temp.owner || "",
          address: temp.address || "",
          color: temp.color || "",
          chassis_category: temp.chassis_type || "",
          chassis_type: temp.frame_type || "FLATBED",
          axle_count: temp.axle_count || 0,
          no_kir: temp.kir_number || "",
          kir_due_date: temp.kir_due_date
            ? new Date(temp.kir_due_date)
            : undefined,
          notes: temp.notes,
        };
      });

      onImported(mapped.filter((d) => d.asset?.name));

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        hidden
        onChange={handleFile}
      />

      <Button
        variant="outline"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <FileSpreadsheetIcon />
        Import Chassis
      </Button>
    </>
  );
}
