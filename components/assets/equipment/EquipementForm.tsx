import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useCreateEquipment } from "@/hooks/useEquipment";
import { CreateAssetSchema } from "@/schema/assetSchema";
import { CreateEquipementSchema } from "@/schema/equipmentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import z from "zod";

interface Props {
  asset: z.infer<typeof CreateAssetSchema> | null;
  onPrevius: () => void;
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

const EquipmentForm: React.FC<Props> = ({ asset, onPrevius }) => {
  const form = useForm<z.infer<typeof CreateEquipementSchema>>({
    resolver: zodResolver(CreateEquipementSchema) as Resolver<
      z.infer<typeof CreateEquipementSchema>
    >,
    defaultValues: {
      asset: asset ?? undefined,
      condition: "",
      equipment_code: "",
      equipment_type: "",
      specification: "",
    },
  });

  const equipmentMutation = useCreateEquipment();

  const onSubmit = (value: z.infer<typeof CreateEquipementSchema>) => {
    equipmentMutation.mutate(value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Separator className="mb-4" />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kondisi Aset</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
        <FormField
          control={form.control}
          name="specification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spesifikasi</FormLabel>
              <FormControl>
                <Textarea placeholder="Type your notes here." {...field} />
              </FormControl>
              <FormDescription>
                contoh: Diesel, 3 Ton Capacity, Brand Toyota
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full justify-between">
          <Button onClick={onPrevius}>Kembali</Button>
          {equipmentMutation.isPending ? (
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

export default EquipmentForm;
