import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = "customizable-status";
const ALL_STATUS_QUERY_KEY = "get-all-status";

export const useGetStatus = (search?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, search],
    queryFn: async () => {
      const res = await api.get("/status", {
        params: { search },
      });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export function useSaveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/status", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ALL_STATUS_QUERY_KEY] });
    },
  });
}

export function useDeleteStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: string[]) => {
      const res = await api.delete("/status", {
        data: data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      
      queryClient.invalidateQueries({ queryKey: [ALL_STATUS_QUERY_KEY] });
    },
  });
}

export function useSetAsDefault() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch("/status", { id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export const useGetAllStatus = () => {
  return useQuery({
    queryKey: [ALL_STATUS_QUERY_KEY],
    queryFn: async () => {
      const res = await api.get("/status/all",);
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};