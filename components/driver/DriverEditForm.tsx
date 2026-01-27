import { useUpdateDriver } from "@/hooks/useDriver";
import { UpdateDriverSchema } from "@/schema/driverSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronDownIcon, Loader2Icon, Pencil, PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "../ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { formatDate, parseDate } from "@/lib/formatDate";

type FormValues = z.infer<typeof UpdateDriverSchema>;

type Props = {
  driver: {
    sim_due_date: Date | null;
    id: string;
    driver_number: string;
    name: string;
    phone: string;
    notes?: string | null;
    is_active: boolean;
  };
};

const DriverEditDialog: React.FC<Props> = ({ driver }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateDriverSchema) as Resolver<
      z.infer<typeof UpdateDriverSchema>
    >,
    defaultValues: {
      name: driver.name,
      phone: driver.phone,
      notes: driver.notes ?? "",
      sim_due_date: driver.sim_due_date ?? undefined,
      is_active: driver.is_active,
    },
  });

  const updateMutation = useUpdateDriver(driver.id);

  useEffect(() => {
    if (open) {
      form.reset({
        name: driver.name,
        phone: driver.phone,
        notes: driver.notes ?? "",
        sim_due_date: driver.sim_due_date ?? undefined,
        is_active: driver.is_active,
      });
    }
  }, [open, driver, form]);

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FieldSet>
                {/* DRIVER NUMBER (READ ONLY) */}
                <FormItem>
                  <FormLabel>Driver Number</FormLabel>
                  <Input value={driver.driver_number} disabled />
                </FormItem>

                {/* NAME */}
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

                {/* PHONE */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sim_due_date"
                  render={({ field }) => (
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
                  )}
                />

                {/* NOTES */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ACTIVE / INACTIVE SWITCH */}
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
              </FieldSet>

              <Field orientation="horizontal" className="justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverEditDialog;
