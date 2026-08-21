"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useChatStore, type Message } from "@/stores/chat.store";
import { useGetConversationsMessages } from "@/hooks/queries/useAI";
import { WelcomeHeading } from "./WelcomeHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import {
  StreamingText,
  ConversationThread,
  ConversationMessage,
  BatchResultView,
} from "./ConversationThreads";

export function ConversationView({
  conversation_id,
}: {
  conversation_id?: string;
}) {
  const messages = useChatStore((s) => s.messages);
  const currentStatus = useChatStore((s) => s.currentStatus);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const setMessages = useChatStore((s) => s.setMessages);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetConversationsMessages(conversation_id);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isPaginatingRef = useRef(false);

  const { ref: topSentinelRef, inView: topInView } = useInView({
    root: containerRef.current,
    threshold: 0,
  });
  useEffect(() => {
    if (isPaginatingRef.current || !messages.length || !bottomRef.current)
      return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!data) return;
    const flattened: Message[] = [...data.pages]
      .reverse()
      .flatMap((page) => [...page.data].reverse())
      .map((m: any): Message => {
        if (m.role === "user") {
          return { role: "user", content: m.content.text, _id: m._id };
        }
        return { role: "assistant", content: m.content, _id: m._id };
      });
    setMessages(flattened);
  }, [data, setMessages]);

  useEffect(() => {
    if (topInView && hasNextPage && !isFetchingNextPage) {
      const el = containerRef.current;
      if (el) prevScrollHeightRef.current = el.scrollHeight;
      isPaginatingRef.current = true;
      fetchNextPage();
    }
  }, [topInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    const diff = el.scrollHeight - prevScrollHeightRef.current;
    if (diff > 0) el.scrollTop = el.scrollTop + diff - 15;
    prevScrollHeightRef.current = 0;
    isPaginatingRef.current = false;
  }, [messages]);

  const isLoadingExisting = !!conversation_id && isLoading;
  if (isLoadingExisting) {
    return [1, 2, 3, 4, 5].map((item) => {
      return <MessagesLoading key={item} />;
    });
  }

  if (messages.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          <WelcomeHeading />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <ConversationThread
      ref={containerRef}
      variant="compact"
      className="flex-1 thin-scrollbar overflow-y-auto"
    >
      <div ref={topSentinelRef} />

      {isFetchingNextPage && <MessagesLoading />}

      {messages.map((msg, i) => (
        <ConversationMessage
          key={msg._id ?? i}
          role={msg.role}
          conversation_id={conversation_id}
          message_id={msg._id}
          copyText={
            msg.role === "user"
              ? msg.content
              : msg.content.kind === "text"
                ? msg.content.text
                : undefined
          }
        >
          {msg.role === "assistant" ? (
            msg.content.kind === "batch" ? (
              <BatchResultView content={msg.content} />
            ) : msg._id ? (
              msg.content.text
            ) : (
              <StreamingText text={msg.content.text} />
            )
          ) : (
            msg.content
          )}
        </ConversationMessage>
      ))}

      {isStreaming && currentStatus ? (
        <ConversationMessage role="system">{currentStatus}</ConversationMessage>
      ) : null}

      <div
        ref={bottomRef}
        style={{
          scrollMarginBottom: "50px",
        }}
      />
    </ConversationThread>
  );
}

function MessagesLoading() {
  return (
    <>
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
    </>
  );
}
