import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetResumes() {
  return useQuery({
    queryKey: ["ai-resumes-list"],
    queryFn: async (data: any) => {
      const res = await api.get("/ai/resumes", data);
      return res.data;
    },
    staleTime: Infinity,
  });
}

export function useGetConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async (data: any) => {
      const res = await api.get("/ai", data);
      return res.data;
    },
    staleTime: Infinity,
  });
}

export function useGetConversationsCount() {
  return useQuery({
    queryKey: ["conversations-count"],
    queryFn: async (data: any) => {
      const res = await api.get("/ai", data);
      return res.data;
    },
    staleTime: Infinity,
  });
}
