import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { db } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { MarkAttendanceButton } from './client';

export const MarkAttendance = async ({
  student_id,
}: {
  student_id: string;
}) => {
  const auth = await getUserAndSession();

  if (!auth) redirect('/signin');
  const isAdmin = await redis.sismember(
    `membership|${auth.user.id}|${pdi_id}`,
    'admin',
  );

  if (!isAdmin) return null;

  const attendance = await db.query.attendance.findFirst({
    columns: {
      created_at: true,
    },
    where: (a, { eq, and }) =>
      and(eq(a.palaistra_id, pdi_id), eq(a.student_id, student_id)),
    orderBy: (a, { desc }) => desc(a.created_at),
  });

  return <MarkAttendanceButton last_attendance_date={attendance?.created_at} />;
};
