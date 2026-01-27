"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/formatDate";

const COLUMNS = [
  { key: "license_plate", label: "No Polisi" },
  { key: "owner", label: "Pemilik" },
  { key: "address", label: "Alamat" },
  { key: "asset.brand", label: "Merk" },
  { key: "asset.model", label: "Model" },
  { key: "year", label: "Tahun" },
//   { key: "cylinder", label: "Silinder" },
  { key: "color", label: "Warna" },
  { key: "frame_number", label: "No Rangka" },
  { key: "engine_number", label: "No Mesin" },
//   { key: "bpkb_number", label: "No BPKB" },
//   { key: "fuel_type", label: "Bahan Bakar" },
  { key: "stnk_number", label: "No STNK" },
//   { key: "stnk_date", label: "Tanggal STNK" },
  { key: "stnk_due_date", label: "Tanggal Jatuh Tempo STNK" },
  { key: "kir_due_date", label: "Tanggal KIR" },
  { key: "no_kir", label: "No KIR" },
//   { key: "notes", label: "Catatan" },
];

function getValue(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? "";
}

export default function VehicleImportPreviewDialog({
  open,
  data,
  onClose,
  onSubmit,
}: {
  open: boolean;
  data: any[];
  onClose: () => void;
  onSubmit: () => void;
}) {

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!w-[95vw] md:w-[80vw] !max-w-none">
        <DialogHeader>
          <DialogTitle>
            Preview Import Kendaraan ({data.length} Data)
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto border rounded">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableHead key={col.key} className="whitespace-nowrap font-bold border border-border">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {COLUMNS.map((col) => {
                  const value = getValue(row, col.key);

                  const isDateField =
                    col.key === "kir_due_date" ||
                    col.key === "asset.purchase_date" ||
                    col.key === "stnk_date" ||
                    col.key === "stnk_due_date";

                  return (
                    <TableCell key={col.key} className="whitespace-nowrap border border-border">
                      {isDateField ? formatDate(value) : String(value ?? "")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={onSubmit}>
            Masukkan ke Database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
