"use client";
import { cn } from "@/lib/utils";
import { PromptComposer } from "./components/prompt-composer";
import { ConversationView } from "./components/ConverstaionView";
import { useChatStore } from "@/stores/chat.store";

export default function AIAssistant({ conversation_id }: { conversation_id?: string }) {
  const hasStarted = useChatStore((s) => s.messages.length > 0);

  return (
    <div
      className={`flex flex-col w-full flex-1 transition-all duration-300 ${
        hasStarted ? "justify-end" : "justify-center items-center m-auto"
      }`}
    >
      <ConversationView conversation_id={conversation_id} />

      <div className={cn("w-full my-3", hasStarted && "mt-auto")}>
        <PromptComposer conversation_id={conversation_id} />
      </div>
    </div>
  );
}