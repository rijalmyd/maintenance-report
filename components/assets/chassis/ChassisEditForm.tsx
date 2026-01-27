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
import { Switch } from "@/components/ui/switch";

import { useUpdateChassis } from "@/hooks/useChassis";
import { UpdateChassisSchema } from "@/schema/chassisSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronDownIcon, Loader2Icon, Pencil } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, parseDate } from "@/lib/formatDate";

interface Props {
  chassisId: string;
  defaultValues: z.infer<typeof UpdateChassisSchema>;
}

const chassisType: string[] = ["FLATBED", "RANGKA", "DECK_KAYU"];
const categoryChassis: string[] = [
  "20 feet",
  "40 feet",
  "Lowbed",
  "Dolly",
  "Sliding",
  "Lainya",
];

const ChassisEditForm: React.FC<Props> = ({
  chassisId,
  defaultValues,
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof UpdateChassisSchema>>({
    resolver: zodResolver(UpdateChassisSchema) as Resolver<
      z.infer<typeof UpdateChassisSchema>
    >,
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const updateChassis = useUpdateChassis(chassisId);

  const onSubmit = (values: z.infer<typeof UpdateChassisSchema>) => {
    updateChassis.mutate(values, {
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
          <DialogTitle>Edit Chassis</DialogTitle>
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
                    <FormLabel>Nama Chassis</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">  
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
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warna</FormLabel>
                    <FormControl>
                      <Input placeholder="contoh: HITAM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* ================= CHASSIS INFORMATION ================= */}
            <h4 className="text-sm font-semibold">Informasi Chassis</h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chassis_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Chassis</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="axle_count"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Jumlah Axel</FormLabel>
                    <FormControl>
                        <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                            field.onChange(
                            e.target.value === "" ? undefined : Number(e.target.value)
                            )
                        }
                        placeholder="contoh: "
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
                name="chassis_type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipe Chassis</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a type chassis" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            <SelectLabel>Tipe Chassis</SelectLabel>
                            {chassisType.map((type, index) => (
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

                <FormField
                control={form.control}
                name="chassis_category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Jenis Chassis</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={defaultValues.chassis_category}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category chassis" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            <SelectLabel>Jenis Chassis</SelectLabel>
                            {categoryChassis.map((category, index) => (
                                <SelectItem key={index} value={category}>
                                {category}
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pemilik</FormLabel>
                        <FormControl>
                          <Input placeholder="contoh: PT ADITYA ANDHIKA UTAMA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="contoh: JL RAYA CAKUNG CILING KM 2 KAV C792, JAKUT" {...field} 
                            multiple
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
                    name="no_kir"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nomor KIR</FormLabel>
                        <FormControl>
                        <Input placeholder="contoh: AST-XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="kir_due_date"
                    render={({ field }) => (
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Textarea placeholder="Type your notes here." {...field} />
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
                    <FormLabel>Status Operasional</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? "Aktif" : "Tidak Aktif"}
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

              <Button type="submit" disabled={updateChassis.isPending}>
                {updateChassis.isPending && (
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

export default ChassisEditForm;
