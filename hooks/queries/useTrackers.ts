import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrackerForm } from "@/types/tracker.types";

const QUERY_KEY = "trackers";

type TrackerParams = {
  page: number;
  sort: string;
  limit: number;
  search?: string;
  status?:any;
  from? :string;
  to?:string;
};

type StatusParams = {
  status_id: string | null;
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

export const useGetTrackerByID = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const res = await api.get("/trackers/get", { params: { id } });
      return res.data ?? null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveTracker = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: TrackerForm) => {
      const res = await api.post("/trackers", data);
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        router.push("/job-tracker");
        toast.success(res.msg || "Status Updated Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      }
    },
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
