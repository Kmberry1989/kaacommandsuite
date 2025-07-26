"use client";

import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import "../globals.css";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
