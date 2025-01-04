import { notFound } from 'next/navigation';

import { eq } from 'drizzle-orm';

import { db, schema } from '@/db';

import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { palaistra_id: string };
}) {
  const { palaistra_id } = await params;

  const [palaistra] = await db
    .select()
    .from(schema.palaistra)
    .where(eq(schema.palaistra.id, palaistra_id));

  if (!palaistra) return notFound();

  return (
    <SidebarProvider>
      <AppSidebar palaistra={palaistra} />
      <SidebarInset className="min- flex h-screen flex-col">
        <header className="sticky top-0 flex h-16 flex-none shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          Palaistra
        </header>
        <>{children}</>
      </SidebarInset>
    </SidebarProvider>
  );
}
