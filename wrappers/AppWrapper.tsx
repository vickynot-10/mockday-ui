"use client";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import AppSidebar from "@/components/app/AppSidebar";
// import AppHeader from "@/components/app/AppHeader";
export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <SidebarProvider>
      <main className=" flex flex-row  w-full max-w-[100%]">
        {" "}
        {/* <AppSidebar /> */}
        <div className=" flex flex-col flex-1">
          {/* <AppHeader /> */}
          <div className=" w-[95%] mx-auto my-4">{children}</div>
        </div>
      </main>
    // </SidebarProvider>
  );
}