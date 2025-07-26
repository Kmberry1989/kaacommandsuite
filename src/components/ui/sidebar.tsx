"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Context for Sidebar state
interface SidebarContextProps {
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ isCollapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Sidebar Root Component
const sidebarVariants = cva(
  "h-full bg-background border-r flex flex-col transition-all duration-300 ease-in-out",
  {
    variants: {
      isCollapsed: {
        true: "w-16",
        false: "w-64",
      },
    },
    defaultVariants: {
      isCollapsed: false,
    },
  }
);

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(sidebarVariants({ isCollapsed }), className, "group")}
        data-collapsible={isCollapsed ? "icon" : "full"}
        {...props}
      />
    );
  }
);
Sidebar.displayName = "Sidebar";

// Sidebar Header
const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 flex items-center justify-between", className)}
      {...props}
    />
  )
);
SidebarHeader.displayName = "SidebarHeader";

// Sidebar Content
const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-grow", className)} {...props} />
  )
);
SidebarContent.displayName = "SidebarContent";

// Sidebar Footer
const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-2 border-t mt-auto", className)}
      {...props}
    />
  )
);
SidebarFooter.displayName = "SidebarFooter";

// Sidebar Menu & Items
const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("space-y-1", className)} {...props} />
  )
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps extends ButtonProps {
  isActive?: boolean;
  tooltip?: string;
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, tooltip, children, ...props }, ref) => {
    const { isCollapsed } = useSidebar();

    const button = (
      <Button
        ref={ref}
        variant={isActive ? "secondary" : "ghost"}
        className={cn("w-full justify-start h-10", className)}
        {...props}
      >
        {children}
      </Button>
    );

    if (isCollapsed && tooltip) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
};
