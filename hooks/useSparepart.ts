import { Sparepart } from "@/generated/prisma/client";
import { handleApiError } from "@/lib/errorHandler";
import api from "@/lib/fetcher";
import { CreateSparepartSchema, UpdateSparepartSchema } from "@/schema/sparepartSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

// get all sparepart
export const useGetAllSparepart = () => {
  return useQuery<Sparepart[]>({
    queryKey: ["spareparts"],
    queryFn: async () => {
      const res = await api.get(`/spareparts`);
      return res.data.data;
    },
  });
};

// create sparepart
export const useCreateSparepart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateSparepartSchema>) => {
      const res = await api.post(`/spareparts`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spareparts"] });
      toast.success("Sparapert created successfully");
    },
    onError: (error: unknown) => {
      handleApiError(error, "Login gagal");
    },
  });
};

export const useDeleteSparepart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sparepartId: string) => {
      const res = await api.delete(`/spareparts/${sparepartId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spareparts"] });
      toast.success("Sparepart deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete Sparepart");
    },
  });
};

export const useUpdateSparepart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof UpdateSparepartSchema> & { id: string }) => {
      const res = await api.patch(`/spareparts/${data.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spareparts"] });
      toast.success("Sparepart updated successfully");
    },
    onError: () => {
      toast.error("Failed to update Sparepart");
    },
  });
};

// getsparepart usage
export const useGetSparepartUsage = (params: { startDate: string; endDate: string }) => {
  return useQuery<any>({
    queryKey: ["sparepart-usage", params],
    queryFn: async () => {
      const res = await api.get(`/spareparts/usage`, {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      });
      return res.data;
    },
  });
};