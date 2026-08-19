import { api } from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export function useAIsendMessage() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/ai", data);
      return res.data;
    },
    onSuccess: (res :any) => {
      console.log(res ,"From")
    },
  });
}
