import { api } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEY = "reminders";

export const useGetReminders = (search?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, search],
    queryFn: async () => {
      const res = await api.get("/reminders", { params : {search} });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};
