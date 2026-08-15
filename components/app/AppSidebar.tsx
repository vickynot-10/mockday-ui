"use client";

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
} from "lucide-react";

export const navData: NavItem[] = [
  { label: "Apps", isSection: true },
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Resumes", icon: FileText, href: "/resumes" },
  { title: "Job Tracker", icon: Briefcase, href: "/job-tracker" },
  { title: "Autofill Rules", icon: Wand2, href: "/autofill" },

  { label: "Settings", isSection: true },
  { title: "Tracker Statuses", icon: Tags, href: "/tracker-status" },
  { title: "Notifications", icon: Bell, href: "/notifications" },
];

export default function AppSidebar() {
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
            <div className="px-4">
              <NavMain items={navData} />
            </div>
          </ScrollArea>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
