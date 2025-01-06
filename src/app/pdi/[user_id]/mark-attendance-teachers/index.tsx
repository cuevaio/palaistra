import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { db } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import { MarkAttendanceButton } from './client';

export const MarkAttendanceTeachers = async ({
  teacher_id,
}: {
  teacher_id: string;
}) => {
  const auth = await getUserAndSession();

  if (!auth) redirect('/signin');
  const isAdmin = await redis.sismember(
    `membership|${auth.user.id}|${pdi_id}`,
    'admin',
  );

  if (!isAdmin) return null;

  const attendance = await db.query.teacher_attendance.findFirst({
    columns: {
      created_at: true,
    },
    where: (a, { eq, and }) =>
      and(eq(a.palaistra_id, pdi_id), eq(a.teacher_id, teacher_id)),
    orderBy: (a, { desc }) => desc(a.created_at),
  });

  return (
    <div>
      <MarkAttendanceButton last_attendance_date={attendance?.created_at} />
      <Link className={cn(buttonVariants({ variant: 'link' }))} href="/">
        Ir a página de alumnos
      </Link>
    </div>
  );
};
