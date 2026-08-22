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
      return res.data?.data ?? null;
      
    },
    staleTime: Infinity,
  });
};

export const useDashboardChartData = (type : number) => {
  return useQuery({
    queryKey: ["chart-db" , type],
    queryFn: async () => {
      const res = await api.get("/dashboard/chart",{
        params : {
          type
        }
      });
      return res.data ?? null;
    },
    staleTime: Infinity,
  });
};
