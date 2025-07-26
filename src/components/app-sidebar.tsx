"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
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
  ChevronsLeft,
  DraftingCompass, // New Icon
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/planner", icon: ClipboardCheck, label: "Planner" },
  { href: "/content", icon: FileText, label: "Content Alchemist" },
  { href: "/insights", icon: Lightbulb, label: "Insight Extractor" },
  { href: "/visualizer", icon: ImageIcon, label: "Artful Images" },
  { href: "/templates", icon: FilePlus2, label: "Template Forge" },
  { href: "/critic-construct", icon: DraftingCompass, label: "Critic Construct" }, // Changed
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <div className={cn("transition-all duration-300 ease-in-out", isCollapsed ? "w-16" : "w-64")}>
        <div className="p-4 flex items-center justify-between">
            <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
                <Palette className="h-6 w-6 text-primary shrink-0" />
                <h1 className={cn("font-headline text-lg font-semibold tracking-tight whitespace-nowrap", isCollapsed && "hidden")}>
                    KAA Media Command
                </h1>
            </div>
            {!isCollapsed && (
                <Button variant="ghost" size="icon" onClick={toggleCollapse}>
                    <ChevronsLeft />
                </Button>
            )}
        </div>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname?.startsWith(item.href)}
              >
                <item.icon className="shrink-0"/>
                <span className={cn("whitespace-nowrap", isCollapsed && "hidden")}>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        <div className="flex flex-col gap-2">
          <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton>
                      <CircleHelp className="shrink-0"/>
                      <span className={cn("whitespace-nowrap", isCollapsed && "hidden")}>Help</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton>
                      <Settings className="shrink-0"/>
                      <span className={cn("whitespace-nowrap", isCollapsed && "hidden")}>Settings</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </div>
  );
}
