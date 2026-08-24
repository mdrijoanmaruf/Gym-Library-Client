import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/Components/Shared/Navbar";
import BackgroundAnimation from "@/Components/Shared/BackgroundAnimation";
import { Providers } from "./Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GymLibrary — Every Exercise. Perfect Form. One Library.",
  description:
    "GymLibrary is the premium exercise reference platform with GIFs and videos for every movement, organized by muscle group.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col bg-[#060608] text-zinc-100 overflow-x-hidden">
        <Providers>
          {/* Full-page animated background — z-0, behind everything */}
          <BackgroundAnimation />

          {/* All real content sits above the background — z-10 */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
