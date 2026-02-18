import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Court Case Management System",
  description: "Judiciary Case Management Prototype - Demo Version",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans">
        <AppProvider>
          <Sidebar />
          <main className="pl-64 min-h-screen">
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </AppProvider>
      </body>
    </html>
  );
}
