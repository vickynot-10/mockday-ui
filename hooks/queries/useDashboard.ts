import { api } from "@/utils/axios";
import {
  useQuery,
} from "@tanstack/react-query";

const QUERY_KEY = "dashboard";

export const useDashboardGetData = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const res = await api.get("/dashboard");
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};
