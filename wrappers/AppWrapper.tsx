"use client";
import AppHeader from "@/components/app/AppHeader";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen mx-auto w-full  flex-col">
      <AppHeader />
      <div className=" px-6 my-3">{children}</div>
    </main>
  );
}
