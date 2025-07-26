import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FontProvider } from "@/context/font-provider";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KAA MEDIA COMMAND SUITE",
  description: "A command suite for the Kokomo Art Association",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <FontProvider>
          {children}
          <Toaster />
        </FontProvider>
      </body>
    </html>
  );
}
