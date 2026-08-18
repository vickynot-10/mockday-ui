import { api } from "@/utils/axios";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const QUERY_KEY = "notifications";

export const useGetUserNotifications = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "all"],
    queryFn: async () => {
      const res = await api.get("/notifications/all");
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

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

export const useGetNotificationsLogs = (filters?: {
  from?: string;
  to?: string;
  type?: number;
}) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, "logs", filters],
    queryFn: async ({ pageParam }) => {
      const res = await api.get("/notifications/logs", {
        params: {
          page: pageParam,
          ...(filters?.from && { from: filters.from }),
          ...(filters?.to && { to: filters.to }),
          ...(filters?.type && { type: filters.type }),
        },
      });
      return res.data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
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

export function useRegisterPush() {
  return useMutation({
    mutationFn: (payload: { push_registered: boolean }) =>
      api.post("/notifications/register-device", payload),
  });
}

export function useSendEmailOtp() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await api.post("/notifications/send-otp", payload);
      return res.data;
    },
  });
}

export function useVerifyEmailOtp() {
  return useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const res = await api.post("/notifications/verify-otp", payload);
      return res.data;
    },
  });
}
