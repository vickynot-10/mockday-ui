import { create } from "zustand";

interface JobFiltersState {
  keyword: string;
  location: string;
  country: string;
  job_posted: string;
  work_mode: string[];
  experience_level: string[];
  job_type: string[];
  sort_by: string;
  sort_dir: string;
  salary_min: number;
  salary_max: number;
  setKeyword: (v: string) => void;
  setLocation: (v: string) => void;
  toggleFacet: (
    key: "work_mode" | "experience_level" | "job_type",
    value: string,
    multiple: boolean,
  ) => void;
  clearFacet: (
    key: "job_posted" | "work_mode" | "experience_level" | "job_type",
  ) => void;
  setSingle: (
    key: "job_posted" | "sort_by" | "sort_dir",
    value: string,
  ) => void;
  resetAll: () => void;
}

const DEFAULTS = {
  keyword: "",
  location: "",
  country: "in",
  job_posted: "",
  work_mode: [] as string[],
  experience_level: [] as string[],
  job_type: [] as string[],
  sort_by: "relevance",
  sort_dir: "desc",
  salary_min: 0,
  salary_max: 0,
};

export const useJobFiltersStore = create<JobFiltersState>((set) => ({
  ...DEFAULTS,
  setKeyword: (v) => set({ keyword: v }),
  setLocation: (v) => set({ location: v }),
  toggleFacet: (key, value, multiple) =>
    set((state) => {
      const current = state[key];
      if (!multiple) {
        return {
          [key]: current.includes(value) ? [] : [value],
        } as Partial<JobFiltersState>;
      }
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { [key]: next } as Partial<JobFiltersState>;
    }),
  clearFacet: (key) =>
    set({
      [key]: Array.isArray(DEFAULTS[key]) ? [] : "",
    } as Partial<JobFiltersState>),
  setSingle: (key, value) => set({ [key]: value } as Partial<JobFiltersState>),
  resetAll: () => set(DEFAULTS),
}));
