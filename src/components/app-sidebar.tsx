"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { SettingsDialog } from "@/components/settings-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import {
  FileText,
  Lightbulb,
  Palette,
  FilePlus2,
  Settings,
  CircleHelp,
  ClipboardCheck,
  DraftingCompass,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  { href: "/planner", icon: ClipboardCheck, label: "Planner" },
  { href: "/content", icon: FileText, label: "Content Alchemist" },
  { href: "/insights", icon: Lightbulb, label: "Insight Extractor" },
  { href: "/visualizer", icon: Palette, label: "Artful Images" },
  { href: "/templates", icon: FilePlus2, label: "Template Forge" },
  { href: "/critic-construct", icon: DraftingCompass, label: "Critic Construct" },
];

// Changed to a default export to resolve build issues
export default function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, setCollapsed } = useSidebar();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                  <Palette className="h-6 w-6 text-primary" />
              </Button>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <h1 className="font-headline text-lg font-semibold tracking-tight">KAA Media Command Suite</h1>
              </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname?.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Help" onClick={() => setHelpOpen(true)}>
                        <CircleHelp className="mr-3 h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Help</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings" onClick={() => setSettingsOpen(true)}>
                        <Settings className="mr-3 h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
             <Button
                variant="ghost"
                className="w-full justify-start h-10"
                onClick={() => setCollapsed(!isCollapsed)}
            >
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                    {isCollapsed ? 
                        <ChevronRight className="mr-3 h-5 w-5" /> : 
                        <ChevronLeft className="mr-3 h-5 w-5" />
                    }
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">Collapse</span>
                </div>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Dialogs that are controlled by this component's state */}
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setSettingsOpen} />
      
      <AlertDialog open={isHelpOpen} onOpenChange={setHelpOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Help</AlertDialogTitle>
            <AlertDialogDescription>
              Ask your husband.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
