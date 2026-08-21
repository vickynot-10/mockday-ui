"use client";
import { useChatStore } from "@/stores/chat.store";
import {
  StreamingText,
  ConversationThread,
  ConversationMessage,
  BatchResultView,
} from "./ConversationThreads";

export function ConversationView() {
  const messages = useChatStore((s) => s.messages);
  const currentStatus = useChatStore((s) => s.currentStatus);
  const isStreaming = useChatStore((s) => s.isStreaming);

  if (messages.length === 0) return null;

  return (
    <ConversationThread variant="bubbles" className="flex-1">
      {messages.map((msg, i) => (
        <ConversationMessage key={i} role={msg.role}>
          {msg.role === "assistant" ? (
            msg.content.kind === "batch" ? (
              <BatchResultView content={msg.content} />
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
    </ConversationThread>
  );
}