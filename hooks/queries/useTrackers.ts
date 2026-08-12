import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = "trackers";

type TrackerParams = {
  page: number;
  sort: string;
  limit :number;
  search?: string;
};

export const useGetTrackers = (params: TrackerParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const res = await api.get("/trackers", { params });

      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};
