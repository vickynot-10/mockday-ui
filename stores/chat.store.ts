import { create } from "zustand";

type Message = { role: "user" | "assistant"; content: string };
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
