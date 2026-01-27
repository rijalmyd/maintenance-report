import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Asset, Prisma } from "@/generated/prisma/client";
import { useBulkDeleteVehicle, useDeleteVehicle, useGetAllVehicle } from "@/hooks/useVehicle";
import { formatDateID } from "@/lib/formatDate";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import React from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../ui/alert-dialog";
import AssetForm from "../AssetForm";
import { nullable } from "zod";
import VehicleEditDialog from "./VehicleEditForm";
import { UpdateVehicleSchema } from "@/schema/vehicleSchema";
import { is } from "date-fns/locale";

type VehicleWithAsset = Prisma.VehicleGetPayload<{
  include: { asset: true };
}>;

export const getColumns = (showAll: boolean): ColumnDef<VehicleWithAsset>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          showAll
            ? table.getIsAllRowsSelected() ||
            (table.getIsSomeRowsSelected() && "indeterminate")
            : table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) =>
          showAll
            ? table.toggleAllRowsSelected(!!v)
            : table.toggleAllPageRowsSelected(!!v)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "asset_name",
    accessorFn: (row) => row.asset?.name ?? "",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{row.original.asset.name}</span>
        <span className="text-xs text-muted-foreground">
          warna: {row.original.color ?? "-"}
        </span>
      </div>
    ),
  },
  {
    header: "Kode",
    cell: ({ row }) => row.original.asset.asset_code,
  },
  {
    accessorKey: "owner",
    header: "Pemilik",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="font-semibold">{row.getValue("owner")}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.address}
        </div>
      </div>
    ),
  },
  {
    header: "Brand",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{row.original.asset.brand}</span>
        <span className="text-xs text-muted-foreground">
          tahun: {row.original.year}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "engine_number",
    header: "Nomor Mesin",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{row.original.engine_number ?? "-"}</span>
        <span className="text-xs text-muted-foreground">
          s/d: {formatDateID(row.original.stnk_due_date)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "no_kir",
    header: "Nomor KIR",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{row.getValue("no_kir")}</span>
        <span className="text-xs text-muted-foreground">
          s/d: {formatDateID(row.original.kir_due_date)}
        </span>
      </div>
    ),
  },
  {
    header: "Status",
    cell: ({ row }) =>
      row.original.asset.is_active ? (
        <Badge>Aktif</Badge>
      ) : (
        <Badge variant="destructive">Tidak Aktif</Badge>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <EditVehicle vehicle={row.original} />
        <DeleteVehicle vehicleId={row.original.id} />
      </div>
    ),
  },
];

const VehicleTable: React.FC = () => {
  const vehicles = useGetAllVehicle();
  const deleteBulkVehicle = useBulkDeleteVehicle(); // ⬅️ asumsi sudah ada

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [showAll, setShowAll] = React.useState(false);

  const columns = React.useMemo(
    () => getColumns(showAll),
    [showAll]
  );

  const table = useReactTable({
    data: vehicles.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 30 },
    },
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id);

  const handleBulkDelete = async () => {
    deleteBulkVehicle.mutate({ ids: selectedIds })
    table.resetRowSelection();
  };

  return (
    <div className="w-full">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Filter nama..."
          value={
            (table.getColumn("asset_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("asset_name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        {selectedIds.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus ({selectedIds.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus vehicle?</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedIds.length} vehicle akan dihapus permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Button
          variant="outline"
          className="ml-auto"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Pagination" : "Tampilkan Semua"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((c) => c.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) =>
                    column.toggleVisibility(!!v)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ===== TABLE ===== */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {(showAll
              ? table.getFilteredRowModel().rows
              : table.getRowModel().rows
            ).map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected()}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ===== FOOTER ===== */}
      {!showAll && (
        <div className="flex items-center justify-end space-x-4 py-4">
          {/* Info selected rows */}
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          {/* Page size dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {table.getState().pagination.pageSize}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[30, 60, 90, 120].map((pageSize) => (
                  <DropdownMenuItem
                    key={pageSize}
                    onClick={() => table.setPageSize(pageSize)}
                  >
                    {pageSize}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Pagination buttons */}
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


const ViewVehicle = ({ vehicle }: { vehicle: VehicleWithAsset }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vehicle Detail</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p><b>Name:</b> {vehicle.asset.name}</p>
          <p><b>Brand:</b> {vehicle.asset.brand}</p>
          <p><b>Color:</b> {vehicle.color}</p>
          <p><b>License Plate:</b> {vehicle.license_plate}</p>
          <p><b>Year:</b> {vehicle.year}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DeleteVehicle = ({ vehicleId }: { vehicleId: string }) => {
  const [open, setOpen] = React.useState(false);
  const deleteVehicle = useDeleteVehicle();

  const handleDelete = async () => {
    try {
      await deleteVehicle.mutateAsync(vehicleId);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            vehicle.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const EditVehicle = ({ vehicle }: { vehicle: VehicleWithAsset }) => {
  const defaultValues = {
    asset_code: vehicle.asset.asset_code,
    brand: vehicle.asset.brand ?? undefined,
    model: vehicle.asset.model ?? undefined,
    name: vehicle.asset.name,
    purchase_price: vehicle.asset.purchase_price ?? undefined,
    serial_number: vehicle.asset.serrial_number ?? undefined,
    purchase_date: vehicle.asset.purchase_date
      ? new Date(vehicle.asset.purchase_date)
      : undefined,
    is_active: vehicle.asset.is_active,
    color: vehicle.color ?? undefined,
    frame_number: vehicle.frame_number ?? undefined,
    engine_number: vehicle.engine_number ?? undefined,
    license_plate: vehicle.license_plate ?? undefined,
    year: vehicle.year ?? undefined,
    no_kir: vehicle.no_kir ?? undefined,
    kir_due_date: vehicle.kir_due_date
      ? new Date(vehicle.kir_due_date)
      : undefined,
    stnk_due_date: vehicle.stnk_due_date
      ? new Date(vehicle.stnk_due_date)
      : undefined,
    notes: vehicle.notes ?? undefined
  }

  return (
    <VehicleEditDialog
      vehicleId={vehicle.id}
      defaultValues={defaultValues}
    />
  );
};


export default VehicleTable;
