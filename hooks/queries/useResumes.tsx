import { api } from "@/utils/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

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
    mutationFn: async (id: string) => {
      const res = await api.post("/resumes/download", { id });
      return res.data;
    },
  });
}
