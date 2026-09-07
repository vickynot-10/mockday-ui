"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "motion/react";
import { MessageSquareOff, MessageSquarePlus, Loader2 } from "lucide-react";
import { useGetConversations } from "@/hooks/queries/useAI";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationList() {
  const pathname = usePathname();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetConversations();

  const conversations = data?.pages.flatMap((page) => page.data) ?? [];
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex h-full w-[280px] flex-col bg-[#1c1d27]">
      <div className="flex items-center justify-end px-3 py-3">
        
        <Link
          href="/ai-assistant"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
        >
          <MessageSquarePlus size={16} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading && (
          <div className="flex flex-col gap-2 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5 rounded-md px-3 py-2">
                <Skeleton className="h-3.5 w-[70%]" />
                <Skeleton className="h-3 w-[35%]" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !conversations.length && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <MessageSquareOff
              size={28}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        )}

        {!isLoading &&
          conversations.map((conversation, index) => {
            const href = `/ai-assistant/${conversation._id}`;
            const isActive = pathname === href;

            return (
              <motion.div
                key={conversation._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(index, 8) * 0.02 }}
              >
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/10",
                    isActive
                      ? "bg-primary! text-primary-foreground!"
                      : "text-sidebar-foreground",
                  )}
                >
                  <span className="truncate font-medium">
                    {conversation.title || "Untitled"}
                  </span>
                </Link>
              </motion.div>
            );
          })}

        <div ref={ref} className="h-1" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}