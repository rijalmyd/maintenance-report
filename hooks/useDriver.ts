import { Driver } from "@/generated/prisma/client";
import { handleApiError } from "@/lib/errorHandler";
import api from "@/lib/fetcher";
import { CreateDriverSchema, UpdateDriverSchema } from "@/schema/driverSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

// get all driver
export const useGetAllDriver = () => {
  return useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await api.get(`/drivers`);
      return res.data.data;
    },
  });
};

// create driver
export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateDriverSchema>) => {
      const res = await api.post(`/drivers`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Sparapert created successfully");
    },
    onError: (error: unknown) => {
      handleApiError(error, "Sparapert created failed");
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (driverId: string) => {
      const res = await api.delete(`/drivers/${driverId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver deleted successfully");
    },
    onError: (error: unknown) => {
      handleApiError(error, "Driver deleted failed");
    },
  });
};

export const useUpdateDriver = (driverId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<z.infer<typeof UpdateDriverSchema>>) => {
      const res = await api.patch(`/drivers/${driverId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver updated successfully");
    },
    onError: (error: unknown) => {
      handleApiError(error, "Driver update failed");
    },
  });
};