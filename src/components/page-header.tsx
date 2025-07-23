import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
}

export function PageHeader({ title, description, children, className, ...props }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 md:p-8", className)} {...props}>
            <div className="grid gap-1">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
                {description && <p className="text-lg text-muted-foreground">{description}</p>}
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}
