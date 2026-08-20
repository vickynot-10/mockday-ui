"use client";
import { useAIsendMessage, useGetResumes } from "@/hooks/queries/useAI";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { FileX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, ChevronDown, Square, Star } from "lucide-react";
import { useRef, useState, useLayoutEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const MAX_ROWS = 8;
const LINE_HEIGHT = 24;

const commands = [
  {
    label: "Resume Rework",
    value: "resume-rework",
    description: "Rewrite your resume with AI suggestions",
  },
  {
    label: "Cover Letter",
    value: "cover-letter",
    description: "Generate a tailored cover letter",
  },
  {
    label: "Job Match",
    value: "job-match",
    description: "Check how well your resume matches a job description",
  },
];

export function PromptComposer() {
  const { mutate, isPending } = useAIsendMessage();
  const { data, isLoading } = useGetResumes();

  const [text, setText] = useState("");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = LINE_HEIGHT * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [text]);

  const resumes = data?.data ?? [];
  const selectedResume = resumes.find((r: any) => r._id === resumeId);

  const slashMatch = /(?:^|\s)\/([a-zA-Z0-9-]*)$/.exec(text);
  const slashQuery = slashMatch?.[1] ?? "";
  const commandsOpen = Boolean(slashMatch);
  const filteredCommands = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
      c.value.toLowerCase().includes(slashQuery.toLowerCase()),
  );

  const applyCommand = (value: string) => {
    const next = text.replace(/(?:^|\s)\/([a-zA-Z0-9-]*)$/, (m) =>
      m.startsWith(" ") ? ` /${value} ` : `/${value} `,
    );
    setText(next);
    textareaRef.current?.focus();
  };

  const canSend = text.trim().length > 0;

  function SelectResume(resume_id: string | null) {
    setResumeId(resume_id);
  }

  const submit = () => {
    if (!canSend || isPending) return;
    mutate({ message: text, resumeId });
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
      <div className="relative">
        <AnimatePresence>
          {commandsOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
                mass: 0.9,
              }}
              className="absolute bottom-full left-0 z-popover mb-1.5 w-72 origin-bottom overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
            >
              <Command shouldFilter={false}>
                <CommandList>
                  <CommandEmpty>No commands found.</CommandEmpty>
                  <CommandGroup heading="Commands">
                    {filteredCommands.map((c) => (
                      <CommandItem
                        key={c.value}
                        value={c.value}
                        onSelect={() => applyCommand(c.value)}
                        className="flex flex-col items-start gap-0.5"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {c.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.description}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={isPending}
          placeholder="Ask anything… type / for commands"
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
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex h-8 max-w-40 items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              />
            }
          >
            <span className="truncate">
              {isLoading
                ? "Loading…"
                : (selectedResume?.filename ?? "No resume selected")}
            </span>
            <ChevronDown className="size-3 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="min-w-56">
            {isLoading && (
              <>
                <DropdownMenuItem disabled className="flex items-center gap-2">
                  <Skeleton className="size-3.5 shrink-0 rounded-full" />
                  <Skeleton className="h-3.5 w-32" />
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="flex items-center gap-2">
                  <Skeleton className="size-3.5 shrink-0 rounded-full" />
                  <Skeleton className="h-3.5 w-24" />
                </DropdownMenuItem>
              </>
            )}

            {!isLoading && resumes.length <= 0 && (
              <div className="flex flex-col items-center gap-2 px-2 py-4 text-center">
                <FileX className="size-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  No resumes found
                </p>
                <Link
                  href="/resumes"
                  className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  Upload a resume
                </Link>
              </div>
            )}

            {resumes &&
              resumes.length > 0 &&
              resumes.map((resume: any) => (
                <>
                  <DropdownMenuItem
                    onClick={() => SelectResume(null)}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">Clear Resume</span>
                    <span className="flex items-center gap-1">
                      {resumeId === null && (
                        <Check className="size-3.5 text-primary" />
                      )}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    key={resume._id}
                    onClick={() => SelectResume(resume._id)}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{resume.filename}</span>
                    <span className="flex items-center gap-1">
                      {resume.default && resume.default === true &&
                        <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      }
                      {resume._id === resumeId &&
                        <Check className="size-3.5 text-primary" />
                      }
                    </span>
                  </DropdownMenuItem>
                </>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
