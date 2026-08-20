"use client";
import AppSidebar from "@/components/app/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/app/AppHeader";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen w-full max-w-[100%] flex-row">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex min-h-0 flex-1 flex-col">
          <AppHeader />
          <div className="mx-auto flex min-h-0 w-[95%] flex-1 flex-col my-4">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </main>
  );
}