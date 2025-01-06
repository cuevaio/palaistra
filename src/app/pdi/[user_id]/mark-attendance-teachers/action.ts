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
  teacher_id?: string;
  hours?: string;
}>;

export const markAttendance = async (
  prevState: null | MarkAttendanceState,
  formData: FormData,
): Promise<MarkAttendanceState> => {
  const teacher_id = formData.get('teacher_id')?.toString();
  const hours = formData.get('hours')?.toString();

  const form = { teacher_id, hours };

  try {
    const auth = await getUserAndSession();

    if (!auth) redirect('/signin');
    const isAdmin = await redis.sismember(
      `membership|${auth.user.id}|${pdi_id}`,
      'admin',
    );

    if (!isAdmin) redirect('/');

    if (!form.teacher_id) throw new Error('teacher_id missing');

    const duration = z
      .string()
      .time()
      .parse('0' + form.hours + ':00:00');

    const membership = await db.query.membership.findFirst({
      where: (e, { eq, and }) =>
        and(eq(e.user_id, form.teacher_id!), eq(e.palaistra_id, pdi_id)),
    });

    if (!membership?.roles.includes('teacher'))
      throw new Error('No teacher found');

    await db.insert(schema.teacher_attendance).values({
      id: id(),

      teacher_id: membership.user_id,
      admin_id: auth.user.id,

      palaistra_id: membership.palaistra_id,

      duration,
    });

    revalidatePath(`/${membership.user_id}`);

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
