"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useChatStore } from "@/stores/chat.store";
import { useGetConversationsMessages } from "@/hooks/queries/useAI";
import { WelcomeHeading } from "./WelcomeHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { ConversationThread, ConversationMessage, TypingIndicator } from "./ConversationThreads";

export function ConversationView({ conversation_id }: { conversation_id?: string }) {
  const messages = useChatStore((s) => s.messages);
  const currentStatus = useChatStore((s) => s.currentStatus);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const setMessages = useChatStore((s) => s.setMessages);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetConversationsMessages(conversation_id);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isPaginatingRef = useRef(false);

  const { ref: topSentinelRef, inView: topInView } = useInView({
    root: containerRef.current,
    threshold: 0,
  });

  useEffect(function syncMessages() {
    if (!data) return;
    const flattened = [...data.pages].reverse().flatMap((page) => {
      return [...page.data].reverse();
    });
    setMessages(flattened);
  }, [data, setMessages]);

  useEffect(function loadOlderMessages() {
    if (topInView && hasNextPage && !isFetchingNextPage) {
      const el = containerRef.current;
      if (el) prevScrollHeightRef.current = el.scrollHeight;
      isPaginatingRef.current = true;
      fetchNextPage();
    }
  }, [topInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useLayoutEffect(function preserveScrollOnPaginate() {
    const el = containerRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    const diff = el.scrollHeight - prevScrollHeightRef.current;
    if (diff > 0) el.scrollTop = el.scrollTop + diff - 15;
    prevScrollHeightRef.current = 0;
    isPaginatingRef.current = false;
  }, [messages]);

  if (!!conversation_id && isLoading) {
    return [1, 2, 3, 4, 5].map((item) => {
      return <MessagesLoading key={item} />;
    });
  }

  if (messages.length === 0) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
          <WelcomeHeading />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <ConversationThread ref={containerRef} variant="compact" className="flex-1 thin-scrollbar overflow-y-auto">
      <div ref={topSentinelRef} />

      {isFetchingNextPage && <MessagesLoading />}

      {messages.map((msg, i) => {
        return <ConversationMessage key={msg._id ?? i} message={msg} />;
      })}

      {isStreaming && !currentStatus && <TypingIndicator />}
      {isStreaming && currentStatus && (
        <ConversationMessage message={{ role: "system", content: { kind: "text", text: currentStatus } }} />
      )}
    </ConversationThread>
  );
}

function MessagesLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <Skeleton className="h-9 w-48 rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-40 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start my-2">
        <Skeleton className="h-9 w-56 rounded-2xl rounded-bl-md" />
      </div>
    </div>
  );
}