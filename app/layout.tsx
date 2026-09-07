import "./globals.css";
import RootWrapper from "@/wrappers/MainWrapper";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${plusJakartaSans.variable} bg-[#17181f]`}
    >
      <body className="min-h-full flex flex-col max-w-full overflow-x-clip">
        <RootWrapper>{children}</RootWrapper>
      </body>
    </html>
  );
}