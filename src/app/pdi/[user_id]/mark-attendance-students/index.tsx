import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import { MarkAttendanceButton } from './client';

export const MarkAttendanceStudents = async () => {
  const auth = await getUserAndSession();

  if (!auth) redirect('/signin');
  const isAdmin = await redis.sismember(
    `membership|${auth.user.id}|${pdi_id}`,
    'admin',
  );

  if (!isAdmin) return null;

  return (
    <div>
      <MarkAttendanceButton />
      <Link className={cn(buttonVariants({ variant: 'link' }))} href="/">
        Ir a página de alumnos
      </Link>
      <Link
        className={cn(buttonVariants({ variant: 'link' }))}
        href="/teachers"
      >
        Ir a página de profesores
      </Link>
    </div>
  );
};
