import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const QUERY_KEY = "trackers";

type TrackerParams = {
  page: number;
  sort: string;
  limit: number;
  search?: string;
};

type StatusParams = {
  status_id: string;
  tracker_id: string;
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

export const useUpdateStatusTrackers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StatusParams) => {
      const res = await api.post("/trackers/update", data);
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "Status Updated Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      }
    },
  });
};
