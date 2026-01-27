import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateChassis } from "@/hooks/useChassis";
import { formatDate, parseDate } from "@/lib/formatDate";
import { CreateAssetSchema } from "@/schema/assetSchema";
import { CreateChessisSchema } from "@/schema/chassisSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronDownIcon, Loader2Icon } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import z from "zod";

interface Props {
  asset: z.infer<typeof CreateAssetSchema> | null;
  onPrevius: () => void;
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

const ChassisForm: React.FC<Props> = ({ asset, onPrevius }) => {
  const form = useForm<z.infer<typeof CreateChessisSchema>>({
    resolver: zodResolver(CreateChessisSchema) as Resolver<
      z.infer<typeof CreateChessisSchema>
    >,
    defaultValues: {
      asset: asset ?? undefined,
      axle_count: undefined,
      chassis_category: "",
      chassis_number: asset?.name ?? undefined,
      chassis_type: undefined,
      kir_due_date: undefined,
      no_kir: "",
      notes: "",
    },
  });

  // chassis mutation
  const chassisMutation = useCreateChassis();

  const onSubmit = (values: z.infer<typeof CreateChessisSchema>) => {
    chassisMutation.mutate(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Separator className="mb-4" />

        {/* <div className="grid grid-cols-2 gap-4">  
          <FormField
          control={form.control}
          name="chassis_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Chassis</FormLabel>
              <FormControl>
                <Input placeholder="contoh: AST-XXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

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
                  placeholder="contoh: 2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <Select onValueChange={field.onChange} value={field.value}>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="no_kir"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor KIR</FormLabel>
                <FormControl>
                  <Input placeholder="contoh: JKT.1234" {...field} />
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
                    <FormLabel>KIR Jatuh tempo</FormLabel>

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

        <div className="flex w-full justify-between">
          <Button onClick={onPrevius}>Kembali</Button>
          {chassisMutation.isPending ? (
            <Button type="button" disabled>
              <Loader2Icon className="animate-spin" />
              Save
            </Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default ChassisForm;
