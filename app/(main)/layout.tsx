import AppWrapper from "@/wrappers/AppWrapper";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mockday");
  if (!token) {
    return redirect("/sign-in");
  }
  return <AppWrapper> {children}</AppWrapper>;
}
