"use client";
import ConversationList from "@/components/common/ConversationList";
import Header from "@/components/shadcn-space/blocks/topbar-04/header";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAIAssistant = pathname.startsWith("/ai-assistant");

  return (
    <main className="flex h-screen w-full flex-col bg-[#17181f]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {isAIAssistant && (
            <motion.aside
              key="conversation-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="h-full shrink-0 overflow-hidden border-r border-white/10"
            >
              <ConversationList />
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto px-6 my-3">{children}</div>
      </div>
    </main>
  );
}