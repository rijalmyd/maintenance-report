// hooks/useReminders.ts
import { handleApiError } from "@/lib/errorHandler"
import api from "@/lib/fetcher"
import { ReminderListSchema, Reminder } from "@/schema/reminderSchema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface GetReminderParams {
  startDate?: string // YYYY-MM-DD
  endDate?: string   // YYYY-MM-DD
  type?: "KIR" | "STNK"
  assetType?: "VEHICLE" | "CHASSIS"
  overdue?: boolean
}

export const useGetReminders = (params: GetReminderParams) => {
  return useQuery<Reminder[]>({
    queryKey: ["reminders", params],
    queryFn: async () => {
      try {
        const query = new URLSearchParams()

        if (params.startDate) query.append("startDate", params.startDate)
        if (params.endDate) query.append("endDate", params.endDate)
        if (params.type) query.append("type", params.type)
        if (params.assetType) query.append("assetType", params.assetType)
        if (params.overdue !== undefined) {
          query.append("overdue", params.overdue.toString())
        }

        const res = await api.get(`/reminders?${query.toString()}`)
        return ReminderListSchema.parse(res.data.data)
      } catch (error) {
        handleApiError(error, "Failed to fetch reminders")
        throw error
      }
    }
  })
}

// MARK DONE
export const useMarkReminderDone = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const res = await api.post(`/reminders/${reminderId}/done`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      toast.success("Reminder marked as done")
    },
    onError: (error) => {
      handleApiError(error, "Failed to mark reminder as done")
    }
  })
}

// get all overdue reminders
export const useGetOverdueReminders = () => {
    return useQuery<Reminder[]>({
      queryKey: ["reminders"],
      queryFn: async () => {
        try {
          const res = await api.get(`/reminders?overdue=true`)
          return ReminderListSchema.parse(res.data.data)
        } catch (error) {
          handleApiError(error, "Failed to fetch overdue reminders")
          throw error
        }
      }
    })
}