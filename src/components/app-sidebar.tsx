"use client";

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
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  FileText,
  Lightbulb,
  ImageIcon,
  FilePlus2,
  Folder,
  Palette,
  Settings,
  CircleHelp,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  { href: "/planner", icon: ClipboardCheck, label: "Planner" },
  { href: "/content", icon: FileText, label: "Content Alchemist" },
  { href: "/insights", icon: Lightbulb, label: "Insight Extractor" },
  { href: "/visualizer", icon: ImageIcon, label: "Artful Images" },
  { href: "/templates", icon: FilePlus2, label: "Template Forge" },
  { href: "/assets", icon: Folder, label: "Asset Command" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
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
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
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
                  <SidebarMenuButton tooltip={{children: "Help"}}>
                      <CircleHelp />
                      <span>Help</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{children: "Settings"}}>
                      <Settings />
                      <span>Settings</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
