import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Accounting Pro - Worldwide Accounting Software",
  description: "Professional accounting software with real-time calculations, multi-currency support, VAT management, and comprehensive financial reporting for businesses worldwide.",
  keywords: "accounting, finance, invoices, VAT, tax, balance sheet, profit loss, worldwide, multi-currency",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <NavigationSidebar />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}