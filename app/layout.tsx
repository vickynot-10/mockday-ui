import "./globals.css";
import RootWrapper from "@/wrappers/MainWrapper";

import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
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
      className={` ${instrumentSerif.variable}`}
    >
      <body className="min-h-full flex flex-col max-w-full overflow-x-clip">
        <RootWrapper>{children}</RootWrapper>
      </body>
    </html>
  );
}
