'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';
import { NeonDbError } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';
import { schedule, schedule_block } from '@/db/schema';

import { ActionState } from '@/lib/action-state-generic-type';
import { days } from '@/lib/constants';
import { compareDays } from '@/lib/utils';

type Form = {
  student_id?: string;
  hour_start?: string;
  hour_end?: string;
  days?: string[];
};
// Using your original types:
type MarkAttendanceState = ActionState<Form>;

export const updateSchedule = async (
  prevState: null | MarkAttendanceState,
  formData: FormData,
): Promise<MarkAttendanceState> => {
  const form = Object.fromEntries(formData.entries()) as Form;
  form['days'] = formData.getAll('days').map((x) => x.toString());

  try {
    const auth = await getUserAndSession();

    if (!auth) redirect('/signin');
    const isAdmin = await redis.sismember(
      `membership|${auth.user.id}|${pdi_id}`,
      'admin',
    );

    if (!isAdmin) redirect('/');

    if (!form.student_id) throw new Error('student_id missing');

    const data = z
      .object({
        student_id: z.string().length(12),
        hour_start: z.string().time(),
        hour_end: z.string().time(),
        days: z.set(z.enum(days)),
      })
      .parse({ ...form, days: new Set(form.days) });

    const [sc] = await db
      .select()
      .from(schedule)
      .where(eq(schedule.student_id, data.student_id))
      .limit(1);

    if (!sc) throw new Error('Schedule not found!');

    const [block] = await db
      .select()
      .from(schedule_block)
      .where(eq(schedule_block.schedule_id, sc.id))
      .limit(1);
    if (!block) throw new Error('Schedule block not found!');

    await db
      .update(schedule_block)
      .set({
        days: Array.from(data.days).toSorted(compareDays),
        hour_end: data.hour_end,
        hour_start: data.hour_start,
      })
      .where(eq(schedule_block.id, block.id));

    revalidatePath(`/${data.student_id}`);

    return {
      success: true,
      form,
    };
  } catch (error) {
    let msg = 'error';
    if (error instanceof NeonDbError) {
      if (error.constraint?.includes('unique')) {
        msg = 'unique_handle';
      }
    }
    console.log(error);
    return {
      success: false,
      error: msg,
      form,
    };
  }
};
