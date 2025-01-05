'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSession } from '@/auth';
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
}>;

export const markAttendance = async (
  prevState: null | MarkAttendanceState,
  formData: FormData,
): Promise<MarkAttendanceState> => {
  const student_id = formData.get('student_id')?.toString();
  const hours = formData.get('hours')?.toString();

  const form = { student_id, hours };

  try {
    const session = await getSession();

    if (!session) redirect('/signin');
    const isAdmin = await redis.sismember(
      `membership|${session.userId}|${pdi_id}`,
      'admin',
    );

    if (!isAdmin) redirect('/');

    if (!form.student_id) throw new Error('student_id missing');

    const duration = z
      .string()
      .time()
      .parse('0' + form.hours + ':00:00');

    const enrollment = await db.query.enrollment.findFirst({
      where: (e, { eq, and }) =>
        and(eq(e.student_id, form.student_id!), eq(e.palaistra_id, pdi_id)),
      with: {
        student: true,
        group: true,
        category: true,
        sport: true,
      },
    });

    if (!enrollment) throw new Error('No enrollment found');

    await db.insert(schema.attendance).values({
      id: id(),
      student_id: enrollment.student_id,
      admin_id: session.userId,

      group_id: enrollment.group_id,
      category_id: enrollment.category_id,
      sport_id: enrollment.sport_id,
      palaistra_id: enrollment.palaistra_id,

      enrollment_id: enrollment.id,
      duration,
    });

    revalidatePath(`/${enrollment.student_id}`);

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
