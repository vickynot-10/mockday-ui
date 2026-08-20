"use client";
import { useAIsendMessage } from "@/hooks/queries/useAI";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, ChevronDown, Square } from "lucide-react";
import { useRef, useState, useLayoutEffect } from "react";
import { useGetResumes } from "@/hooks/queries/useAI";

const MODELS = ["gpt-4o", "gpt-4o-mini", "claude-sonnet"];
const MAX_ROWS = 8;
const LINE_HEIGHT = 24;

export function PromptComposer() {
  const { mutate, isPending } = useAIsendMessage();

  const {data ,isLoading  }  = useGetResumes()

  const [text, setText] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = LINE_HEIGHT * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [text]);

  const canSend = text.trim().length > 0;

  const submit = () => {
    if (!canSend || isPending) return;
    mutate({ message: text, model });
    setText("");
  };

  return (
    <form
      data-slot="prompt-composer"
      className="group/composer relative flex w-full flex-col gap-2 rounded-2xl border border-border bg-card/80 p-2.5 shadow-sm backdrop-blur-md transition-[box-shadow,border-color] focus-within:border-ring focus-within:shadow-md"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        disabled={isPending}
        placeholder="Ask anything…"
        aria-label="Prompt"
        className="w-full resize-none bg-transparent px-2 pt-1.5 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
      />

      <div className="flex items-center justify-between gap-2 px-1">
        <div className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={modelOpen}
            onClick={() => setModelOpen((o) => !o)}
            onBlur={() => setTimeout(() => setModelOpen(false), 120)}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {model}
            <ChevronDown
              className={`size-3 transition-transform ${modelOpen ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {modelOpen ? (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 32,
                  mass: 0.9,
                }}
                className="absolute bottom-full left-0 z-popover mb-1.5 min-w-40 origin-bottom rounded-xl border border-border bg-popover p-1 shadow-lg"
              >
                {MODELS.map((m) => (
                  <li key={m}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={m === model}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setModel(m);
                        setModelOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent ${m === model ? "font-medium text-foreground" : "text-muted-foreground"}`}
                    >
                      {m}
                      {m === model ? (
                        <Check className="size-3.5 text-primary" />
                      ) : null}
                    </button>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {text.length > 0 ? (
            <span className="text-xs tabular-nums text-muted-foreground">
              {text.length}
            </span>
          ) : null}
          <button
            type="submit"
            disabled={!canSend || isPending}
            aria-label={isPending ? "Sending…" : "Send message"}
            className="relative inline-flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-[transform,opacity,background-color] hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPending ? (
                <motion.span
                  key="stop"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                >
                  <Square className="size-3.5" fill="currentColor" />
                </motion.span>
              ) : (
                <motion.span
                  key="send"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                >
                  <ArrowUp className="size-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </form>
  );
}
