"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
    ClipboardCheck,
    FileText,
    Lightbulb,
    ImageIcon,
    FilePlus2,
    Palette,
    Settings,
    CircleHelp,
    Menu,
    MessageSquareWarning,
    FolderKanban,
    Scale,
    GanttChartSquare,
    ClipboardPenLine,
} from "lucide-react";
import { Button } from "./ui/button";
import { SettingsDialog } from "@/components/settings-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const mainNavItems = [
  { href: "/planner", icon: ClipboardCheck, label: "Planner" },
  { href: "/content", icon: FileText, label: "Content Alchemist" },
  { href: "/insights", icon: Lightbulb, label: "Insight Extractor" },
  { href: "/visualizer", icon: ImageIcon, label: "Artful Images" },
  { href: "/templates", icon: FilePlus2, label: "Template Forge" },
  { href: "/critic-construct", icon: MessageSquareWarning, label: "Critic Construct" },
];

const governanceNavItems = [
    { href: "/governance/filing-history", icon: FolderKanban, label: "Filing History" },
    { href: "/governance/role-analyzer", icon: Scale, label: "Role Analyzer" },
    { href: "/governance/compliance-dashboard", icon: GanttChartSquare, label: "Compliance Dashboard" },
]

export default function AppSidebar() {
  const pathname = usePathname();
  const { setCollapsed } = useSidebar();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setCollapsed(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Palette className="h-6 w-6 text-primary hidden md:block" />
            <div className="flex flex-col group-data-[collapsible=false]:animate-in group-data-[collapsible=false]:fade-in group-data-[collapsible=false]:slide-in-from-left-4">
              <h1 className="font-headline text-lg font-semibold tracking-tight">
                KAA Media Command Suite
              </h1>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname?.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             <div className="mt-4 mb-2 ml-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=true]:hidden">GOVERNANCE</div>
             {governanceNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname?.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
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
                <SidebarMenuButton
                  tooltip={{ children: "Help" }}
                  onClick={() => setHelpOpen(true)}
                >
                  <CircleHelp />
                  <span>Help</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{ children: "Settings" }}
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setSettingsOpen} />
      <AlertDialog open={isHelpOpen} onOpenChange={setHelpOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Help</AlertDialogTitle>
            <AlertDialogDescription>Ask your husband.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
