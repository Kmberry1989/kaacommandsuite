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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";

const navItems = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
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
                <h1 className="font-headline text-lg font-semibold tracking-tight">Art Hub Kokomo</h1>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
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
          <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:py-2">
              <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person face"/>
                  <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold">Gallery Manager</span>
                  <span className="text-xs text-muted-foreground">manager@kokomoart.org</span>
              </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
