import { Prisma } from "@/generated/prisma/client";
import api from "@/lib/fetcher";
import { CreateChessisSchema, DeleteChassisBulkSchema, UpdateChassisSchema } from "@/schema/chassisSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "sonner";
import z from "zod";

type ChassisWithAsset = Prisma.ChassisGetPayload<{
  include: { asset: true };
}>;

// get all chassis
export const useGetAllChassis = () => {
  return useQuery<ChassisWithAsset[]>({
    queryKey: ["chassises"],
    queryFn: async () => {
      const res = await api.get(`/chassises`);
      return res.data.data;
    },
  });
};

// create Chassis
export const useCreateChassis = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateChessisSchema>) => {
      const res = await api.post(`/chassises`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chassises"], exact: false });
      toast.success("Asset created successfully");
      router.push("/admin/assets?asset=chassis");
      setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to create Asset");
    },
  });
};

export const useDeleteChassis = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chassisId: string) => {
      const res = await api.delete(`/chassises/${chassisId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chassises"], exact: false });
      toast.success("Chassis deleted successfully");
      router.push("/admin/assets?asset=chassis");
      setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to delete Chassis");
    },
  });
};

export const useUpdateChassis = (chassisId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<z.infer<typeof UpdateChassisSchema>>) => {
      const res = await api.patch(`/chassises/${chassisId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chassises"] });
      toast.success("Chassis updated successfully");
        setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to update Chassis");
    },
  });
};

// bulk create chassis
export const useBulkCreateChassis = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateChessisSchema>[]) => {
      const res = await api.post(`/chassises/bulk`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chassises"], exact: false });
      toast.success("Chassises created successfully");
        setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to create Chassises");
    },
  });
};  

// bulk delete chassis
export const useBulkDeleteChassis = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof DeleteChassisBulkSchema>) => {
      const res = await api.post(`/chassises/bulk-delete`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chassises"], exact: false });
      toast.success("Chassises deleted successfully");
      setTimeout(() => {
        router.reload();
      }, 1000); 
    },
    onError: () => {
      toast.error("Failed to delete Chassises");
    },
  });
};