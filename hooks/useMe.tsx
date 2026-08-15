import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/axios";

interface User {
  id: string;
  email: string;
  name: string;
}

export const useMe = () => {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/profile/me");
      return res.data?.data;
    },
    staleTime: Infinity,
    retry: false,
  });
};