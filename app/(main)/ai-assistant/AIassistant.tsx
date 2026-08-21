"use client";
import { cn } from "@/lib/utils";
import { PromptComposer } from "./components/prompt-composer";
import { WelcomeHeading } from "./components/WelcomeHeading";
import { ConversationView } from "./components/ConverstaionView";
import { useChatStore } from "@/stores/chat.store";
import { motion, AnimatePresence } from "motion/react";
import { useGetConversationsMessages } from "@/hooks/queries/useAI";

export default function AIAssistant(  { conversation_id } : {conversation_id? :string}) {
  const hasStarted = useChatStore((s) => s.messages.length > 0);
  const setMessages = useChatStore((s) => s.setMessages);

  const { data , isLoading } =useGetConversationsMessages(conversation_id)

  return (
    <div
      className={`flex flex-col w-full flex-1 transition-all duration-300 ${
        hasStarted ? "justify-end" : "justify-center items-center m-auto"
      }`}
    >
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <WelcomeHeading />
          </motion.div>
        )}
      </AnimatePresence>

      <ConversationView />

      <div className={cn("w-full my-3", hasStarted && "mt-auto")}>
        <PromptComposer />
      </div>
    </div>
  );
}
