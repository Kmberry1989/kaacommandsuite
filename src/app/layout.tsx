import type { Metadata } from "next";
import "./globals.css";
import { FontProvider } from "@/context/font-provider";
import { AppBody } from "./app-body"; // Import the new client component

export const metadata: Metadata = {
  title: "KAA MEDIA COMMAND SUITE",
  description: "Your central command for KAA media strategy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <FontProvider>
        <AppBody>{children}</AppBody>
      </FontProvider>
    </html>
  );
}
