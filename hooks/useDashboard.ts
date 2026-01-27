import { useQuery } from "@tanstack/react-query";
import api from "@/lib/fetcher";
import { handleApiError } from "@/lib/errorHandler";

export type DashboardSummary = {
  total_today_maintenances: number;
  total_this_month_maintenances: number;
  total_active_users: number;
  total_spareparts: number;
};

export const useDashboardSummary = () => {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      try {
        const res = await api.get("/dashboard/summary");
        return res.data.data;
      } catch (error) {
        handleApiError(error, "Gagal memuat dashboard summary");
        throw error;
      }
    },
    staleTime: 60 * 1000, // cache 1 menit (dashboard ideal)
    refetchOnWindowFocus: false,
  });
};
