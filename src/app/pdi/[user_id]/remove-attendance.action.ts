'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSession } from '@/auth';
import { NeonDbError } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { ActionState } from '@/lib/action-state-generic-type';

// Using your original types:
type RemoveAttendanceState = ActionState;

export const removeAttendance = async (
  prevState: null | RemoveAttendanceState,
  formData: FormData,
): Promise<RemoveAttendanceState> => {
  const attendance_id = formData.get('attendance_id')?.toString();

  try {
    const session = await getSession();

    if (!session) redirect('/signin');
    const isAdmin = await redis.sismember(
      `membership|${session.userId}|${pdi_id}`,
      'admin',
    );

    if (!isAdmin) redirect('/');
    if (!attendance_id) throw new Error('missing attendance_id');

    const [attendance] = await db
      .delete(schema.attendance)
      .where(eq(schema.attendance.id, attendance_id))
      .returning();

    revalidatePath(`/${attendance.student_id}`);
    return {
      success: true,
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
    };
  }
};
