import { handleApiError } from "@/lib/errorHandler";
import api from "@/lib/fetcher";
import { Maintenence } from "@/types/maintenence";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { on } from "events";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Tambahkan interface untuk response API
interface MaintenanceResponse {
  data: Maintenence[];
  pagging: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export const useGetAllMaintenence = (params: { page: number; size: number; search?: string }) => {
  return useQuery<MaintenanceResponse>({
    queryKey: ["maintenences", params], // Key berubah setiap kali params berubah
    queryFn: async () => {
      const res = await api.get(`/maintenences`, {
        params: {
          page: params.page,
          size: params.size,
          search: params.search,
        },
      });
      return res.data;
    },
  });
};

export const useDeleteMaintenence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maintenenceId: string) => {
      const res = await api.delete(`/maintenences/${maintenenceId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenences"] });
      toast.success("Maintenence deleted successfully");
    },
    onError: (error: unknown) => {
      handleApiError(error, "Maintenence delete failed");
    },
  });
};

export const useUpdateMaintenence = (maintenenceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Maintenence>) => {
      const res = await api.put(`/maintenences/${maintenenceId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenences"] });
      toast.success("Maintenence updated successfully");
    },
    onError: (error: unknown) => {
      handleApiError(error, "Maintenence update failed");
    },
  });
};

// get maintenence by asset id
// export const useGetMaintenenceByAssetId = (assetId: string) => {
//   return useQuery<Maintenence[]>({
//     queryKey: ["maintenences", assetId],
//     queryFn: async () => {
//       try {
//         const res = await api.get(`/maintenences/asset/${assetId}`);
//         return res.data.data;
//       } catch (error) {
//         handleApiError(error, "Failed to fetch maintenences for asset");
//         throw error;
//       }
//     },
//   });
// };

// Di dalam hooks/useMaintenences.ts
export const useGetMaintenenceByAssetId = (id: string, options?: any) => {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => fetchByAssetId(id),
    ...options, // Ini agar { enabled: ... } bisa masuk
  });
};

const fetchByAssetId = async (assetId: string): Promise<Maintenence[]> => {
  try {
    const res = await api.get(`/maintenences/asset/${assetId}`);
    return res.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch maintenences for asset");
    throw error;
  }
};