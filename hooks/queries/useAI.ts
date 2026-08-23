import { api } from "@/utils/axios";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

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

export function useGetConversationsMessages(id?: string) {
  return useInfiniteQuery({
    queryKey: ["conversations-messages", id],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const res = await api.get("/ai/conversation", {
        params: { page: pageParam, conversation_id: id },
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.data?.length || lastPage.data.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: Infinity,
    enabled: !!id,
  });
}

export function useGetConversations() {
  return useInfiniteQuery({
    queryKey: ["conversations"],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const res = await api.get("/ai", { params: { page: pageParam } });
      return res.data as {
        success: boolean;
        data: { _id: string; title: string; created_on: string }[];
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.data?.length || lastPage.data.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: Infinity,
  });
}

export interface DownloadResumeType {
  type: "docx" | "pdf";
  message_id: string;
}

export function useDownloadResume() {
  return useMutation({
    mutationFn: async ({ type, message_id }: DownloadResumeType) => {
      const res = await api.post("/ai/download", {
        type,
        message_id,
      });

      return res.data;
    },

    onSuccess: (res: any) => {
      if (res?.data?.success === true) {
        window.open(res.data.data.url, "_blank");
      }
    },
  });
}