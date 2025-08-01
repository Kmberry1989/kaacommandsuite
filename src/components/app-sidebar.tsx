'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BotMessageSquare,
  FileText,
  GanttChart,
  Image,
  LayoutDashboard,
  PenSquare,
  Settings,
  Shapes,
  Sheet,
  Users,
  Palette
} from 'lucide-react';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import { SettingsDialog } from './settings-dialog';

export function AppSidebar() {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const sidebarItems = [
    {
      group: 'Dashboard',
      items: [
        {
          link: '/dashboard',
          label: 'Overview',
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
      ],
    },
    {
      group: 'Content',
      items: [
        {
          link: '/content',
          label: 'Content Hub',
          icon: <FileText className="h-4 w-4" />,
        },
        {
          link: '/templates',
          label: 'Templates',
          icon: <Sheet className="h-4 w-4" />,
        },
        {
          link: '/assets',
          label: 'Artful Images',
          icon: <Image className="h-4 w-4" />,
        },
        {
          link: '/scribble-diffusion',
          label: 'Scribble Diffusion',
          icon: <Palette className="h-4 w-4" />,
        },
      ],
    },
    {
      group: 'Planning',
      items: [
        {
          link: '/planner',
          label: 'Planner',
          icon: <GanttChart className="h-4 w-4" />,
        },
      ],
    },
    {
      group: 'Analytics',
      items: [
        {
          link: '/insights',
          label: 'Insights',
          icon: <BotMessageSquare className="h-4 w-4" />,
        },
        {
          link: '/visualizer',
          label: 'Visualizer',
          icon: <Shapes className="h-4 w-4" />,
        },
      ],
    },
    {
      group: 'Governance',
      items: [
        {
          link: '/governance/role-analyzer',
          label: 'Role Analyzer',
          icon: <Users className="h-4 w-4" />,
        },
        {
          link: '/governance/filing-history',
          label: 'Filing History',
          icon: <FileText className="h-4 w-4" />,
        },
        {
            link: '/governance/compliance-dashboard',
            label: 'Compliance',
            icon: <LayoutDashboard className="h-4 w-4" />,
        }
      ],
    },
  ];

  if (isMobile) {
    return null;
  }

  return (
    <div className="flex h-full w-64 flex-col gap-4 border-r bg-gray-100/40 p-4 dark:bg-gray-800/40">
      <div className="flex h-16 items-center font-semibold">
        <span>KAA Command Suite</span>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={['Dashboard', 'Content', 'Planning', 'Analytics', 'Governance']} className="w-full">
          {sidebarItems.map((group) => (
            <AccordionItem value={group.group} key={group.group}>
              <AccordionTrigger>{group.group}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <Link href={item.link} key={item.link}>
                      <Button
                        variant={pathname === item.link ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Separator />
      <div>
        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
            <span className="ml-2">Settings</span>
        </Button>
        <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    </div>
  );
}
