import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = "notifications";

export const useGetNotifications = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export function useSaveNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/notifications", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}



export function useSendEmailOtp() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      api.post("/notifications/send-otp", payload),
  });
}

export function useVerifyEmailOtp() {
  return useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      api.post("/notifications/verify-otp", payload),
  });
}

export function useRegisterPush() {
  return useMutation({
    mutationFn: (payload: { push_registered: boolean }) =>
      api.post("/notifications/register-device", payload),
  });
}