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
  { key: "asset.name", label: "Nama Asset" },
  { key: "owner", label: "Pemilik" },
  { key: "address", label: "Alamat" },
  { key: "asset.brand", label: "Brand" },
  { key: "asset.model", label: "Model" },
  { key: "asset.serial_number", label: "Serial Number" },
  { key: "chassis_category", label: "Jenis Chassis" },
  { key: "chassis_type", label: "Tipe Chassis" },
  { key: "axle_count", label: "Jumlah Excel" },
  { key: "color", label: "Warna"},
  { key: "asset.purchase_date", label: "Tanggal Pembelian" },
  { key: "no_kir", label: "No KIR" },
  { key: "kir_due_date", label: "KIR Berlaku Sampai" },
  { key: "notes", label: "Catatan" },
];

function getValue(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? "";
}

export default function ChassisImportPreviewDialog({
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
            Preview Import Chassis ({data.length} Data)
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
                    col.key === "asset.purchase_date";

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
