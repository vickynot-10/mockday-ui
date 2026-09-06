"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/app/AppHeader";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen px-4 py-2.5 max-w-[90%]  mx-auto w-full  flex-col">
      <AppHeader />
      {children}
    </main>
  );
}
