import { CreateAssetSchema } from "@/schema/assetSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronDownIcon, Plus } from "lucide-react";
import React, { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import ChassisForm from "./chassis/ChassisForm";
import EquipmentForm from "./equipment/EquipementForm";
import VehicleForm from "./vehicle/VehicleForm";
import { formatDate, parseDate } from "@/lib/formatDate";

const AssetForm: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [assetData, setAssetData] = useState<z.infer<
    typeof CreateAssetSchema
  > | null>(null);
  const [assetType, setAssetType] = useState<
    "vehicle" | "chassis" | "equipment" | null
  >(null);

  const form = useForm<z.infer<typeof CreateAssetSchema>>({
    resolver: zodResolver(CreateAssetSchema) as Resolver<
      z.infer<typeof CreateAssetSchema>
    >,
    defaultValues: {
      brand: "",
      model: "",
      name: "",
      purchase_price: undefined,
      serial_number: "",
      purchase_date: undefined,
    },
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  function onSubmit(values: z.infer<typeof CreateAssetSchema>) {
    nextStep();
    setAssetData(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus />
          Tambah Aset
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Data Aset</DialogTitle>
        </DialogHeader>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-primary rounded transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        {step === 1 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Separator className="mb-4" />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Cth: Canter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Field>
                <FormItem>
                  <FormLabel>Jenis Aset</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(asset) =>
                        setAssetType(
                          asset as "vehicle" | "chassis" | "equipment"
                        )
                      }
                      value={assetType ?? undefined}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Jenis Asset</SelectLabel>
                          <SelectItem value="vehicle">Kendaraan</SelectItem>
                          <SelectItem value="chassis">Chassis</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </Field>

              <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="ex: Toyota, dll"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Cth: Avanza, dll"
                        {...field}
                      />
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
                    <FormLabel>Harga / Satuan</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                        <InputGroupAddon>Rp</InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Seri</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Masukan Nomer Seri"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  //           id="date"
                  //           className="w-full justify-between font-normal"
                  //         >
                  //           {field.value
                  //             ? field.value.toLocaleDateString()
                  //             : "Select date"}
                  //           <ChevronDownIcon />
                  //         </Button>
                  //       </PopoverTrigger>
                  //       <PopoverContent
                  //         className="w-auto overflow-hidden p-0"
                  //         align="start"
                  //       >
                  //         <Calendar
                  //           mode="single"
                  //           selected={field.value ?? undefined}
                  //           onSelect={(date) =>
                  //             field.onChange(date ?? undefined)
                  //           }
                  //         />
                  //       </PopoverContent>
                  //     </Popover>
                  //   </FormControl>
                  //   <FormMessage />
                  // </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Berikutnya</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
        {step === 2 && assetType === "vehicle" && (
          <VehicleForm asset={assetData} onPrevius={prevStep} />
        )}
        {step === 2 && assetType === "chassis" && (
          <ChassisForm asset={assetData} onPrevius={prevStep} />
        )}
        {step === 2 && assetType === "equipment" && (
          <EquipmentForm asset={assetData} onPrevius={prevStep} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssetForm;