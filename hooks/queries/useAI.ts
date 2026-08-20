import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAIsendMessage() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/ai", data);
      return res.data;
    },
    onSuccess: (res: any) => {
      console.log(res, "From");
    },
  });
}

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
