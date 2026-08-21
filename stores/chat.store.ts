import { create } from "zustand";

export type ResumeReworkResult = {
  paragraphs: { id: string; text: string }[];
  error: string | null;
};

export type CoverLetterResult = {
  cover_letter: string;
  error: string | null;
};

export type JobMatchResult = {
  match_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  gaps: string[];
  summary: string;
  error: string | null;
};

export type BatchContent = {
  kind: "batch";
  resume_rework?: ResumeReworkResult;
  cover_letter?: CoverLetterResult;
  job_match?: JobMatchResult;
};

export type TextContent = {
  kind: "text";
  text: string;
};

export type AssistantContent = TextContent | BatchContent;

export type UserMessage = { role: "user"; content: string };
export type AssistantMessage = { role: "assistant"; content: AssistantContent };
export type Message = UserMessage | AssistantMessage;

type ChatStore = {
  messages: Message[];
  currentStatus: string | null;
  isStreaming: boolean;
  addMessage: (msg: Message) => void;
  setStatus: (status: string | null) => void;
  setStreaming: (val: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  currentStatus: null,
  isStreaming: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setStatus: (status) => set({ currentStatus: status }),
  setStreaming: (val) => set({ isStreaming: val }),
}));