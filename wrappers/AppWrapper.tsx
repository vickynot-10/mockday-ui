"use client";
import Header from "@/components/shadcn-space/blocks/topbar-04/header";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen mx-auto w-full bg-[#17181f]  flex-col">
      <Header />
      <div className=" px-6 my-3">{children}</div>
    </main>
  );
}
