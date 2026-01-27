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
import { useBulkDeleteEquipment, useDeleteEquipment, useGetAllEquipment } from "@/hooks/useEquipment";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2 } from "lucide-react";
import React, { use } from "react";
import EquipmentEditForm from "./EquipmentEditForm";
import { useDeleteVehicle } from "@/hooks/useVehicle";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";

type EquipmentWithAsset = Prisma.EquipmentGetPayload<{
  include: { asset: true };
}>;

export const getColumns = (showAll: boolean): ColumnDef<EquipmentWithAsset>[] => [
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
        onCheckedChange={(v) => {
          if (showAll) {
            table.toggleAllRowsSelected(!!v); // 🔥 select ALL data
          } else {
            table.toggleAllPageRowsSelected(!!v); // page only
          }
        }}
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
    accessorKey: "no",
    header: "No",
    cell: ({ row }) => <div className="capitalize">{row.index + 1}</div>,
  },
  {
    id: "asset_name",
    accessorFn: (row) => row.asset?.name ?? "",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const asset = row.original.asset as Asset;

      return (
        <div className="flex flex-col">
          <span className="font-semibold">{asset?.name}</span>
          <span className="text-sm text-muted-foreground">
            {asset?.brand && `brand: ${asset.brand}`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "asset.code",
    header: "Kode",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.asset?.asset_code}</div>
    ),
  },
  {
    accessorKey: "asset.model",
    header: "Model",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.asset?.model}</span>
          <span className="text-xs text-muted-foreground">
            no seri: {row.original.asset?.serrial_number}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "asset.status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {row.original.asset.is_active ? (
            <Badge>Aktif</Badge>
          ) : (
            <Badge variant="destructive">Tidak Aktif</Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const equipment = row.original;
      return (
        <div className="flex justify-end gap-2">
          {/* <ViewEquipment equipment={equipment} /> */}
          <EditEquipment equipment={equipment} />
          <DeleteEquipment equipmentId={equipment.id} />
        </div>
      );
    },
  },
];

const EquipmentTable: React.FC = () => {
  const spareparts = useGetAllEquipment();
  const deleteBulkEquipment = useBulkDeleteEquipment();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [showAll, setShowAll] = React.useState(false);
  const columns = React.useMemo(
    () => getColumns(showAll),
    [showAll]
  );

  const table = useReactTable({
    data: spareparts.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 30,
      },
    },
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id);

  const handleBulkDelete = async () => {
    deleteBulkEquipment.mutate({ ids: selectedIds })
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
          onChange={(event) =>
            table.getColumn("asset_name")?.setFilterValue(event.target.value)
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
                <AlertDialogTitle>Hapus data terpilih?</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedIds.length} equipment akan dihapus permanen.
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

const DeleteEquipment = ({ equipmentId }: { equipmentId: string }) => {
  const [open, setOpen] = React.useState(false);
  const deleteEquipment = useDeleteEquipment();

  const handleDelete = async () => {
    try {
      await deleteEquipment.mutateAsync(equipmentId);
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
            equipment.
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

const EditEquipment = ({ equipment }: { equipment: EquipmentWithAsset }) => {
  const defaultValues = {
    asset_code: equipment.asset.asset_code,
    brand: equipment.asset.brand ?? undefined,
    model: equipment.asset.model ?? undefined,
    name: equipment.asset.name,
    purchase_price: equipment.asset.purchase_price ?? undefined,
    serial_number: equipment.asset.serrial_number ?? undefined,
    purchase_date: equipment.asset.purchase_date
      ? new Date(equipment.asset.purchase_date)
      : undefined,
    is_active: equipment.asset.is_active,
    equipment_code: equipment.equipment_code ?? undefined,
    equipment_type: equipment.equipment_type ?? undefined,
    specification: equipment.specification ?? undefined,
    condition: equipment.condition ?? undefined,
  }

  return (
    <EquipmentEditForm
      equipmentId={equipment.id}
      defaultValues={defaultValues}
    />
  );
};

export default EquipmentTable;
