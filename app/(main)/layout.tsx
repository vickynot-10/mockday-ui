import AppWrapper from "@/wrappers/AppWrapper";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OneSignalInit from "@/wrappers/OneSignalWrapper";
import Script from "next/script";
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
  return (
    <>
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
        defer
      />{" "}
      <OneSignalInit /> <AppWrapper> {children}</AppWrapper>{" "}
    </>
  );
}
