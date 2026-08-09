import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = "autofill";

export const useGetAutoFill = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const res = await api.get("/autofill");
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export function useSaveAutoFill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/autofill", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
