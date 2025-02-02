'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';
import { NeonDbError } from '@neondatabase/serverless';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';
import { schedule, schedule_block } from '@/db/schema';

import { ActionState } from '@/lib/action-state-generic-type';
import { id } from '@/lib/nanoid';

type Form = {
  student_id?: string;
  valid_from?: string;
  valid_to?: string;
};
// Using your original types:
type RenewScheduleState = ActionState<Form>;

export const renewSchedule = async (
  prevState: null | RenewScheduleState,
  formData: FormData,
): Promise<RenewScheduleState> => {
  const form = Object.fromEntries(formData.entries()) as Form;

  console.log(form);

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
        valid_from: z.string().date(),
        valid_to: z.string().date(),
      })
      .parse(form);

    const [sc] = await db
      .select()
      .from(schedule)
      .where(eq(schedule.student_id, data.student_id))
      .orderBy(desc(schedule.valid_to))
      .limit(1);

    if (!sc) throw new Error('Schedule not found!');

    const [block] = await db
      .select()
      .from(schedule_block)
      .where(eq(schedule_block.schedule_id, sc.id))
      .limit(1); // TODO: support multiple blocks
    if (!block) throw new Error('Schedule block not found!');

    const schedule_id = id();
    await db.insert(schedule).values({
      id: schedule_id,
      student_id: data.student_id,
      palaistra_id: pdi_id,
      sport: 'swimming',
      valid_from: data.valid_from,
      valid_to: data.valid_to,
    });

    await db.insert(schedule_block).values({
      ...block,
      id: id(),
      schedule_id,
    });

    revalidatePath(`/${data.student_id}`);
    revalidatePath(`/`);

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
