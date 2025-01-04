import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { Button } from '@/components/ui/button';

export const Attendance = async ({ user_id }: { user_id: string }) => {
  const auth = await getUserAndSession();
  if (!auth) redirect('/signin');

  const isAdmin = await redis.sismember(
    `membership|${auth.user.id}|${pdi_id}`,
    'admin',
  );

  if (!isAdmin) return null;
  return (
    <div>
      <Button>Marcar asistencia: {user_id}</Button>
    </div>
  );
};
