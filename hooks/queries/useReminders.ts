import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const QUERY_KEY = "trackers";

type ReminderParams = {
  search?: string;
};


export const useGetReminders = (params: ReminderParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const res = await api.get("/reminders", { params });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};


export const useDeleteReminders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.delete("/trackers", {
        data : data
      });
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "Deleted Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      }
    },
  });
};


