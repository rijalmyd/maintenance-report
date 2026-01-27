import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useUpdateVehicle } from "@/hooks/useVehicle";
import { UpdateVehicleSchema } from "@/schema/vehicleSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronDownIcon, Loader2Icon, Pencil } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { useState } from "react";
import z from "zod";
import { Switch } from "@/components/ui/switch";
import { formatDate, parseDate } from "@/lib/formatDate";

interface Props {
  vehicleId: string;
  defaultValues: z.infer<typeof UpdateVehicleSchema>;
}

const VehicleEditDialog: React.FC<Props> = ({
  vehicleId,
  defaultValues,
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof UpdateVehicleSchema>>({
    resolver: zodResolver(UpdateVehicleSchema) as Resolver<
      z.infer<typeof UpdateVehicleSchema>
    >,
    defaultValues,
  });

  const updateVehicle = useUpdateVehicle(vehicleId);

  const onSubmit = (values: z.infer<typeof UpdateVehicleSchema>) => {
    updateVehicle.mutate(values, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ================= ASSET INFORMATION ================= */}
            <h4 className="text-sm font-semibold">Informasi Aset</h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="asset_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Aset</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Pembelian</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Tanggal Pembelian</FormLabel>

                    <div className="flex gap-2">
                      {/* INPUT MANUAL */}
                      <FormControl>
                        <Input
                          placeholder="DD/MM/YYYY"
                          value={formatDate(field.value)}
                          disabled
                          onChange={(e) => {
                            const parsed = parseDate(e.target.value);
                            field.onChange(parsed);
                          }}
                        />
                      </FormControl>

                      {/* DATE PICKER */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date ?? undefined)}
                            captionLayout="dropdown"   // 🔥 bulan & tahun dropdown
                            fromYear={1990}
                            toYear={2100}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <FormMessage />
                  </FormItem>
                // <FormItem>
                //   <FormLabel>Tanggal Pembelian</FormLabel>
                //   <FormControl>
                //     <Popover>
                //       <PopoverTrigger asChild>
                //         <Button
                //           variant="outline"
                //           className="w-full justify-between font-normal"
                //         >
                //           {field.value
                //             ? field.value.toLocaleDateString()
                //             : "Pilih tanggal"}
                //           <ChevronDownIcon />
                //         </Button>
                //       </PopoverTrigger>
                //       <PopoverContent className="w-auto p-0">
                //         <Calendar
                //           mode="single"
                //           selected={field.value}
                //           onSelect={field.onChange}
                //         />
                //       </PopoverContent>
                //     </Popover>
                //   </FormControl>
                //   <FormMessage />
                // </FormItem>
              )}
            />

            <Separator />

            {/* ================= VEHICLE INFORMATION ================= */}
            <h4 className="text-sm font-semibold">Informasi Kendaraan</h4>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engine_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Mesin</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frame_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Rangka</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="license_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plat Nomor</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stnk_due_date"
                render={({ field }) => (
                  // <FormItem>
                  //   <FormLabel>STNK Jatuh Tempo</FormLabel>
                  //   <FormControl>
                  //     <Popover>
                  //       <PopoverTrigger asChild>
                  //         <Button
                  //           variant="outline"
                  //           className="w-full justify-between font-normal"
                  //         >
                  //           {field.value
                  //             ? field.value.toLocaleDateString()
                  //             : "Pilih tanggal"}
                  //           <ChevronDownIcon />
                  //         </Button>
                  //       </PopoverTrigger>
                  //       <PopoverContent className="w-auto p-0">
                  //         <Calendar
                  //           mode="single"
                  //           selected={field.value}
                  //           onSelect={field.onChange}
                  //         />
                  //       </PopoverContent>
                  //     </Popover>
                  //   </FormControl>
                  //   <FormMessage />
                  // </FormItem>
                  <FormItem>
                    <FormLabel>STNK Jatuh Tempo</FormLabel>

                    <div className="flex gap-2">
                      {/* INPUT MANUAL */}
                      <FormControl>
                        <Input
                          placeholder="DD/MM/YYYY"
                          value={formatDate(field.value)}
                          disabled
                          onChange={(e) => {
                            const parsed = parseDate(e.target.value);
                            field.onChange(parsed);
                          }}
                        />
                      </FormControl>

                      {/* DATE PICKER */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date ?? undefined)}
                            captionLayout="dropdown"   // 🔥 bulan & tahun dropdown
                            fromYear={1990}
                            toYear={2100}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kir_due_date"
                render={({ field }) => (
                  // <FormItem>
                  //   <FormLabel>KIR Jatuh Tempo</FormLabel>
                  //   <FormControl>
                  //     <Popover>
                  //       <PopoverTrigger asChild>
                  //         <Button
                  //           variant="outline"
                  //           className="w-full justify-between font-normal"
                  //         >
                  //           {field.value
                  //             ? field.value.toLocaleDateString()
                  //             : "Pilih tanggal"}
                  //           <ChevronDownIcon />
                  //         </Button>
                  //       </PopoverTrigger>
                  //       <PopoverContent className="w-auto p-0">
                  //         <Calendar
                  //           mode="single"
                  //           selected={field.value}
                  //           onSelect={field.onChange}
                  //         />
                  //       </PopoverContent>
                  //     </Popover>
                  //   </FormControl>
                    
                  //   <FormMessage />
                  // </FormItem>
                  <FormItem>
                    <FormLabel>KIR Jatuh Tempo</FormLabel>

                    <div className="flex gap-2">
                      {/* INPUT MANUAL */}
                      <FormControl>
                        <Input
                          placeholder="DD/MM/YYYY"
                          value={formatDate(field.value)}
                          disabled
                          onChange={(e) => {
                            const parsed = parseDate(e.target.value);
                            field.onChange(parsed);
                          }}
                        />
                      </FormControl>

                      {/* DATE PICKER */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date ?? undefined)}
                            captionLayout="dropdown"   // 🔥 bulan & tahun dropdown
                            fromYear={1990}
                            toYear={2100}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="no_kir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor KIR</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <FormLabel>Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {field.value ? "Active" : "Inactive"}
                        </div>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>

              <Button type="submit" disabled={updateVehicle.isPending}>
                {updateVehicle.isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleEditDialog;
