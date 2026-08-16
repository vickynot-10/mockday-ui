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
    <main className=" flex flex-row  w-full max-w-[100%]">

      <SidebarProvider>
        {" "}
        <AppSidebar />
        <div className=" flex flex-col flex-1">
          <AppHeader />
          <div className=" w-[95%] mx-auto my-4">{children}</div>
        </div>
      </SidebarProvider>
    </main>
  );
}
