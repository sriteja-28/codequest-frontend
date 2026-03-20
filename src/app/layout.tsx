import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/ui/Navbar";

const inter    = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const syne      = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: { default: "CodeQuest", template: "%s | CodeQuest" },
  description: "Master algorithms and data structures through practice, contests, and AI-powered coaching.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} ${syne.variable} font-sans bg-surface text-slate-100 antialiased`}>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}