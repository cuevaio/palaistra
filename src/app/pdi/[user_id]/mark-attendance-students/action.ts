'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';
import { NeonDbError } from '@neondatabase/serverless';
import { z } from 'zod';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { ActionState } from '@/lib/action-state-generic-type';
import { id } from '@/lib/nanoid';

// Using your original types:
type MarkAttendanceState = ActionState<{
  student_id?: string;
  hours?: string;
  date?: string;
}>;

export const markAttendance = async (
  prevState: null | MarkAttendanceState,
  formData: FormData,
): Promise<MarkAttendanceState> => {
  const student_id = formData.get('student_id')?.toString();
  const hours = formData.get('hours')?.toString();
  const date = formData.get('date')?.toString();

  const form = { student_id, hours, date };

  try {
    const auth = await getUserAndSession();

    if (!auth) redirect('/signin');
    const isAdmin = await redis.sismember(
      `membership|${auth.user.id}|${pdi_id}`,
      'admin',
    );

    if (!isAdmin) redirect('/');

    if (!form.student_id) throw new Error('student_id missing');

    const duration = z
      .string()
      .time()
      .parse('0' + form.hours + ':00:00');

    const schedule = await db.query.schedule.findFirst({
      where: (e, { eq, and }) =>
        and(eq(e.student_id, form.student_id!), eq(e.palaistra_id, pdi_id)),
    });

    if (!schedule) throw new Error('No schedule found');

    await db.insert(schema.attendance).values({
      id: id(),

      student_id: schedule.student_id,
      admin_id: auth.user.id,

      palaistra_id: schedule.palaistra_id,

      sport: 'swimming',
      duration,

      taken_at: form.date ? form.date + 'T05:00:00Z' : new Date().toISOString(),
    });

    revalidatePath(`/${schedule.student_id}`);

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
