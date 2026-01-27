import { Prisma } from "@/generated/prisma/client";
import api from "@/lib/fetcher";
import { CreateVehicleSchema, DeleteVehicleBulkSchema, UpdateVehicleSchema } from "@/schema/vehicleSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "sonner";
import z from "zod";

type VehicleWithAsset = Prisma.VehicleGetPayload<{
  include: { asset: true };
}>;

// get all vehicle
export const useGetAllVehicle = () => {
  return useQuery<VehicleWithAsset[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await api.get(`/vehicles`);
      return res.data.data;
    },
  });
};

// create Vehicle
export const useCreateVehicle = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateVehicleSchema>) => {
      const res = await api.post(`/vehicles`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
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

export const useDeleteVehicle = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const res = await api.delete(`/vehicles/${vehicleId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle deleted successfully");
      router.push("/admin/assets?asset=vehicle");
      setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to delete Vehicle");
    },
  });
};

export const useUpdateVehicle = (vehicleId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<z.infer<typeof UpdateVehicleSchema>>) => {
      const res = await api.patch(`/vehicles/${vehicleId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle updated successfully");
      router.push("/admin/assets?asset=vehicle");
      setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to update Vehicle");
    },
  });
};

export const useBulkCreateVehicle = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateVehicleSchema>[]) => {
      const res = await api.post(`/vehicles/bulk`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicles imported successfully");
      router.push("/admin/assets?asset=vehicle");
      setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to import Vehicles");
    },
  });
};

export const useBulkDeleteVehicle = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof DeleteVehicleBulkSchema>) => {
      const res = await api.post(`/vehicles/bulk-delete`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicles deleted successfully");
      router.push("/admin/assets?asset=vehicle");
      setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to delete Vehicles");
    },
  });
};