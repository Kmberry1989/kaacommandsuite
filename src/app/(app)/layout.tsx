import { AppSidebar } from '@/components/app-sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
