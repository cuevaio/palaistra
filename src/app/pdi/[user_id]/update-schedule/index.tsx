import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';
import { ScheduleBlockSelect, ScheduleSelect } from '@/db/schema';

import { UpdateScheduleForm } from './client';

export const UpdateSchedule = async ({
  schedule,
}: {
  schedule: ScheduleSelect & {
    blocks: ScheduleBlockSelect[];
  };
}) => {
  const auth = await getUserAndSession();

  if (!auth) redirect('/signin');
  const isAdmin = await redis.sismember(
    `membership|${auth.user.id}|${pdi_id}`,
    'admin',
  );

  if (!isAdmin) return null;

  return (
    <div>
      <UpdateScheduleForm
        days={schedule.blocks[0].days}
        hour_start={schedule.blocks[0].hour_start}
        hour_end={schedule.blocks[0].hour_end}
      />
    </div>
  );
};
