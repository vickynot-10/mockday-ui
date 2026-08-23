import { api } from "@/utils/axios";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

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
      const res = await api.post(
        "/ai/download",
        { type, message_id },
        { responseType: "blob" },
      );
      return res.data as Blob;
    },

    onSuccess: (blob: Blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = variables.type === "pdf" ? "resume.pdf" : "resume.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: async (error) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data instanceof Blob) {
          const text = await data.text();

          try {
            const json = JSON.parse(text);
            toast.error(json.error ?? json.msg ?? "Failed to generate");
          } catch {
            toast.error(text ?? "Failed to generate");
          }
        }
      }
    },
  });
}
