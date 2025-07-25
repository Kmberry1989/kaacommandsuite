"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarVariants = cva(
  "flex h-screen flex-col transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-background border-r",
      },
      size: {
        default: "w-64",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

interface SidebarContextProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

const SidebarProvider = ({ children, collapsible = false, defaultCollapsed = false }: { children: ReactNode; collapsible?: boolean; defaultCollapsed?: boolean; }) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    const toggleCollapse = () => {
        if(collapsible) {
            setIsCollapsed(prev => !prev);
        }
    };
    
    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
            {children}
        </SidebarContext.Provider>
    )
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, size, collapsible, defaultCollapsed, children, ...props }, ref) => {
    return (
        <SidebarProvider collapsible={collapsible} defaultCollapsed={defaultCollapsed}>
            <SidebarContent ref={ref} className={cn(sidebarVariants({ variant, size }), className)} {...props}>
                {children}
            </SidebarContent>
        </SidebarProvider>
    );
  }
);
Sidebar.displayName = "Sidebar";


const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({className, children, ...props}, ref) => {
        const { isCollapsed } = useSidebar();
        return (
            <div
                ref={ref}
                className={cn("flex flex-col", className)}
                data-collapsed={isCollapsed}
                {...props}
            >
                {children}
            </div>
        )
    }
);
SidebarContent.displayName = "SidebarContent";


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

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-grow px-2 space-y-1", className)}
      {...props}
    />
  )
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("", className)} {...props} />
    )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button> & { isActive?: boolean }>(
    ({ className, isActive, children, ...props }, ref) => {
        const { isCollapsed } = useSidebar();
        return (
            <Button
                ref={ref}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start h-10", isCollapsed && "justify-center", className)}
                {...props}
            >
                {children}
            </Button>
        )
    }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 mt-auto", className)}
      {...props}
    />
  )
);
SidebarFooter.displayName = "SidebarFooter";


export {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider
};
