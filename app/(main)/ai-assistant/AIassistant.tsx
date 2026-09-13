"use client";
import { useEffect } from "react";
import { PromptComposer } from "./components/prompt-composer";
import { ConversationView } from "./components/ConverstaionView";
import { useChatStore } from "@/stores/chat.store";
import { useGetConversationsMessages } from "@/hooks/queries/useAI";

export default function AIAssistant({
  conversation_id,
}: {
  conversation_id?: string;
}) {
  const messages = useChatStore((s) => s.messages);
  const reset = useChatStore((s) => s.reset);
  const setMessages = useChatStore((s) => s.setMessages);

  const { data, isLoading, isFetching } =
    useGetConversationsMessages(conversation_id);

  useEffect(() => {
    reset();
  }, [conversation_id, reset]);

  useEffect(() => {
    if (conversation_id && data) {
      setMessages(data.pages.flatMap((page) => page.data ?? []));
    }
  }, [conversation_id, data, setMessages]);

  const isExistingConversation = !!conversation_id;
  const hasStarted = messages.length > 0 || isExistingConversation;

  return (
    <div
      className={`flex flex-col h-full w-full flex-1 min-h-0 transition-all duration-300 ${
        hasStarted ? "justify-end" : "justify-center items-center m-auto"
      }`}
    >
      <ConversationView
        conversation_id={conversation_id}
        isLoading={isExistingConversation && isLoading}
      />
      <div className="w-full pt-3">
        <PromptComposer conversation_id={conversation_id} />
      </div>
    </div>
  );
}
