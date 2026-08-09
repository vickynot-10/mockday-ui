"use client";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/axios";
import { toast } from "sonner";

export function useUploadPDF() {
  return useMutation({
    mutationFn: async (data: any) => {
    const res = await api.post("/upload/pdf", data, {
  headers: { "Content-Type": "multipart/form-data" },
});
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data, "frommm");
    },
  });
}
