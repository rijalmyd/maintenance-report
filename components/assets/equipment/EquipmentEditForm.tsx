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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUpdateEquipment } from "@/hooks/useEquipment"; // Diasumsikan nama hook ini
import { formatDate, parseDate } from "@/lib/formatDate";
import { UpdateEquipmentSchema } from "@/schema/equipmentSchema"; // Diasumsikan nama skema ini
import { zodResolver } from "@hookform/resolvers/zod";
import { de } from "date-fns/locale";
import { CalendarIcon, ChevronDownIcon, Loader2Icon, Pencil } from "lucide-react";
import { useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import z from "zod";

interface Props {
  equipmentId: string;
  defaultValues: z.infer<typeof UpdateEquipmentSchema>;
}

const condition = ["Baik", "Perlu Diperbaiki", "Rusak Ringan", "Rusak"];
const equpmentType = [
  "Forklift",
  "Material Handling",
  "Office Furniture",
  "Electronics",
  "Utilities",
  "Lainya",
];

const EquipmentEditForm: React.FC<Props> = ({
  equipmentId,
  defaultValues,
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof UpdateEquipmentSchema>>({
    resolver: zodResolver(UpdateEquipmentSchema) as Resolver<
      z.infer<typeof UpdateEquipmentSchema>
    >,
    defaultValues,
  });

  const updateEquipment = useUpdateEquipment(equipmentId);

  const onSubmit = (values: z.infer<typeof UpdateEquipmentSchema>) => {
    updateEquipment.mutate(values, {
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
          <DialogTitle>Edit Peralatan</DialogTitle>
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
                    <FormLabel>Nama Alat</FormLabel>
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
                    <FormLabel>Brand / Merk</FormLabel>
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
                    <FormLabel>Model / Tipe</FormLabel>
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
                //             ? new Date(field.value).toLocaleDateString()
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
              )}
            />

            <Separator />

            {/* ================= EQUIPMENT SPECIFIC INFO ================= */}
            <h4 className="text-sm font-semibold">Spesifikasi Peralatan</h4>

            <div className="grid grid-cols-2 gap-4">

               <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Kondisi Aset</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={defaultValues.condition}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a asset condition" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            <SelectLabel>Kondisi</SelectLabel>
                            {condition.map((con, index) => (
                                <SelectItem key={index} value={con}>
                                {con}
                                </SelectItem>
                            ))}
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
               <FormField
                        control={form.control}
                        name="equipment_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jenis Equipment</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value} defaultValue={defaultValues.equipment_type}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select equipment type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Tipe Equipment</SelectLabel>
                                    {equpmentType.map((type, index) => (
                                      <SelectItem key={index} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

              {/* <FormField
                control={form.control}
                name="warranty_expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Masa Berlaku Garansi</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            {field.value
                              ? new Date(field.value).toLocaleDateString()
                              : "Pilih tanggal"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <FormLabel>Status Operasional</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? "Aktif / Tersedia" : "Tidak Aktif / Rusak"}
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

              <Button type="submit" disabled={updateEquipment.isPending}>
                {updateEquipment.isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentEditForm;