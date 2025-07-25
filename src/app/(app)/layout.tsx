"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed, toggleCollapse } = useSidebar();
    const isMobile = useMobile();

    return(
        <div className="flex h-screen">
             {!isMobile && (
                <div className="fixed top-0 left-0 h-full z-20">
                    <AppSidebar />
                </div>
            )}
            <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out" style={{ paddingLeft: isMobile ? 0 : (isCollapsed ? '4rem' : '16rem') }}>
                {isMobile && (
                     <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                        <Sheet>
                           <SheetTrigger asChild>
                             <Button size="icon" variant="outline" className="sm:hidden">
                               <Menu className="h-5 w-5" />
                               <span className="sr-only">Toggle Menu</span>
                             </Button>
                           </SheetTrigger>
                           <SheetContent side="left" className="sm:max-w-xs p-0">
                                <AppSidebar />
                           </SheetContent>
                         </Sheet>
                     </header>
                )}
                {children}
            </main>
        </div>
    )
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider collapsible={true}>
        <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}

