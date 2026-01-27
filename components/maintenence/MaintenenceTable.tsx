import { useDeleteMaintenence, useGetAllMaintenence } from "@/hooks/useMaintenences";
import { formatDateID } from "@/lib/formatDate";
import { Maintenence } from "@/types/maintenence";
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
import { ChevronDown, Download, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";

export const columns: ColumnDef<Maintenence>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
    accessorKey: "record_number",
    header: "Nomor",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.record_number}</div>
    ),
  },
  {
    accessorKey: "asset",
    header: "Asset",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.asset.name}</div>
    ),
  },
  {
    accessorKey: "km_asset",
    header: "Kilometer",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.km_asset} Km</div>
    ),
  },
  {
    accessorKey: "user_id",
    header: "User",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.user.fullname}</div>
    ),
  },
  {
    accessorKey: "complaint",
    header: "Komplain",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.complaint}</div>
    ),
  },
  {
    accessorKey: "asset.asset_type",
    header: "Jenis Aset",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.asset.asset_type}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Perbaikan",
    cell: ({ row }) => (
      <div className="capitalize">{formatDateID(row.original.createdAt)}</div>
    ),
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const maintenance = row.original;
      return (
        <div className="flex justify-end gap-2">
          <DownloadMaintenancePDF maintenanceId={maintenance.id} />
          <DeleteMaintenance maintenanceId={maintenance.id} />
        </div>
      );
    },
  },
];

const MaintenenceTable: React.FC = () => {
  // 1. State untuk Pagination & Search (Sync dengan API)
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: 0, // Tanstack mulai dari 0
    pageSize: 30,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  // 2. Fetch data berdasarkan state di atas
  const { data: response, isLoading } = useGetAllMaintenence({
    page: pageIndex + 1, // API kita mulai dari 1
    size: pageSize,
    search: globalFilter,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // 3. Konfigurasi Table
  const table = useReactTable({
    data: response?.data ?? [],
    columns,
    pageCount: response?.pagging.totalPages ?? -1, // Total halaman dari API
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: setPagination,
    manualPagination: true, // WAJIB: Beritahu tabel ini server-side
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(), // Hapus ini jika full server-side
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari laporan (Nomor, Asset, Driver)..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset ke hal 1 saat cari
          }}
          className="max-w-sm"
        />
        {isLoading && <Loader2 className="ml-4 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell></TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === "no"
                        ? (pageIndex * pageSize) + (i + 1) // Penomoran urut antar halaman
                        : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Pagination */}
      <div className="flex items-center justify-end space-x-4 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
           Halaman {pageIndex + 1} dari {response?.pagging.totalPages || 1}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <select
            value={pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="border rounded p-1 text-sm"
          >
            {[30, 60, 90].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage() || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const DeleteMaintenance = ({ maintenanceId }: { maintenanceId: string }) => {
  const [open, setOpen] = React.useState(false);
  const deleteMaintenance = useDeleteMaintenence();

  const handleDelete = async () => {
    try {
      await deleteMaintenance.mutateAsync(maintenanceId);
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
            maintenance report.
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

// add authorization header to fetch request and open in new browser tab
export const DownloadMaintenancePDF = ({
  maintenanceId,
}: {
  maintenanceId: string;
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const authToken = localStorage.getItem("token");

      const response = await fetch(
        `/api/maintenences/pdf?id=${maintenanceId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `maintenance_${maintenanceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  // const handleDownload = () => {
  //   // open PDF in new tab or force download
  //   window.open(
  //     `/api/maintenences/pdf?id=${maintenanceId}`,
  //     "_blank"
  //   );
  // };
  // const handleDownload = () => {
  //   const authToken = localStorage.getItem("token"); // Adjust based on how you store the token

  //   // make timeout 1 minute to fetch request
  //   fetch(`/api/maintenences/pdf?id=${maintenanceId}`, {
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${authToken}`,
  //     },
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //       return response.blob();
  //     })
  //     .then((blob) => {
  //       // Create a URL for the blob
  //       const url = window.URL.createObjectURL(new Blob([blob]));
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.setAttribute("download", `maintenance_${maintenanceId}.pdf`);
  //       document.body.appendChild(link);
  //       link.click();
  //       link.parentNode?.removeChild(link);
  //     })
  //     .catch((error) => {
  //       console.error("There was a problem with the fetch operation:", error);
  //     });
  // };

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        onClick={handleDownload}
        disabled={loading}
        title="Download PDF"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>

      {/* Loading Dialog */}
      <AlertDialog open={loading}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader className="items-center text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <AlertDialogTitle>Mengunduh PDF</AlertDialogTitle>
            <AlertDialogDescription>
              Mohon tunggu, laporan sedang diproses…
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MaintenenceTable;
