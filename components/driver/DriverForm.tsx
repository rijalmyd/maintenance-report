import { useCreateDriver } from "@/hooks/useDriver";
import { CreateDriverSchema } from "@/schema/driverSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronDownIcon, Loader2Icon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Resolver, useForm } from "react-hook-form";
import z, { unknown } from "zod";
import { Button } from "../ui/button";
import { Field, FieldGroup, FieldSet } from "../ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { formatDate, parseDate } from "@/lib/formatDate";

const DriverForm: React.FC = () => {
  const form = useForm<z.infer<typeof CreateDriverSchema>>({
    resolver: zodResolver(CreateDriverSchema) as Resolver<
          z.infer<typeof CreateDriverSchema>
      >,
    defaultValues: {
      name: "",
      phone: "",
      notes: "",
      sim_due_date: undefined,
    },
  });

  const driverMutation = useCreateDriver();

  const onSubmit = (values: z.infer<typeof CreateDriverSchema>) => {
    driverMutation.mutate(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: 6286155380996" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              <FormField
                control={form.control}
                name="sim_due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Kadaluarsa SIM</FormLabel>

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
                )}
              />


            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FieldSet>
          <Field orientation="horizontal">
            {driverMutation.isPending ? (
              <Button type="button" disabled>
                <Loader2Icon className="animate-spin" />
                Save
              </Button>
            ) : (
              <Button type="submit">Submit</Button>
            )}
          </Field>
        </FieldGroup>
      </form>
    </Form>
  );
};

export default DriverForm;
