import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = "resumes";

export const useGetResumes = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const res = await api.get("/resumes");
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export function useDownloadURL() {
  return useMutation({
    mutationFn: async ({
      id,
      mode,
    }: {
      id: string;
      mode: "view" | "download";
    }) => {
      const res = await api.post("/resumes/download", { id, mode });
      return res.data;
    },
  });
}

export function useMarkAsDefault() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch("/resumes", { id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteResumes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await api.post("/resumes/delete", { ids });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
