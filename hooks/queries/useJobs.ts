import { api } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEY = "jobs";

interface JobSearchParams {
  keyword: string;
  location: string;
  country: string;
  job_posted: string;
  work_mode: string[];
  experience_level: string[];
  job_type: string[];
  sort_by: string;
  salary_min: number;
  salary_max: number;
  page: number;
}

export const useGetJobs = (params: JobSearchParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const res = await api.get("/jobs/search", { params });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
};
