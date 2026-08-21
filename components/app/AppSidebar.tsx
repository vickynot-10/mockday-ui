"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavMain, NavItem } from "../common/NavMain";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Wand2,
  Tags,
  Bell,
  Bot,
  ArrowLeft,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import ConversationList from "../common/ConversationList";

type Mode = "main" | "conversations";

export default function AppSidebar() {
  const pathname = usePathname();
  const [manualMode, setManualMode] = useState<Mode | null>(null);

  useEffect(() => {
    setManualMode(null);
  }, [pathname]);

  const routeMode: Mode = pathname?.startsWith("/ai-assistant")
    ? "conversations"
    : "main";
  const mode = manualMode ?? routeMode;

  const navData: NavItem[] = [
    { label: "Apps", isSection: true },
    { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    { title: "Resumes", icon: FileText, href: "/resumes" },
    {
      title: "AI Assistant",
      icon: Bot,
      href: "/ai-assistant",
      onClick: () => setManualMode("conversations"),
    },
    { title: "Job Tracker", icon: Briefcase, href: "/job-tracker" },
    { title: "Autofill Rules", icon: Wand2, href: "/autofill" },

    { label: "Settings", isSection: true },
    { title: "Tracker Statuses", icon: Tags, href: "/tracker-status" },
    {
      title: "Notifications",
      icon: Bell,
      children: [
        { title: "Preferences", href: "/notifications/preferences" },
        { title: "History", href: "/notifications/history" },
      ],
    },
  ];

  return (
    <Sidebar className="px-0 h-full [&_[data-slot=sidebar-inner]]:h-full">
      <div className="flex flex-col gap-6">
        <SidebarHeader className="px-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <a href="#" className="w-full h-full"></a>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="px-4 relative">
              <AnimatePresence mode="wait" initial={false}>
                {mode === "main" ? (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <NavMain items={navData} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="conversations"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {/* Sits at the exact same top slot the "Apps" label occupied */}
                    <button
                      onClick={() => setManualMode("main")}
                      className="flex w-full items-center gap-2 rounded-md px-0 py-2 text-xs font-medium uppercase text-sidebar-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to main</span>
                    </button>

                    <ConversationList />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
