'use server';

import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';
import { NeonDbError } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { ActionState } from '@/lib/action-state-generic-type';
import { days, Role } from '@/lib/constants';
import { id } from '@/lib/nanoid';
import { compareDays } from '@/lib/utils';

// Using your original types:

type Form = {
  name?: string;
  national_id?: string;
  birth_date?: string;
  parent_name?: string;
  parent_national_id?: string;
  email?: string;
  hour_start?: string;
  hour_end?: string;
  days?: string[];
};

const capitalizeName = (x: string) =>
  x
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

type RegisterStudentState = ActionState<Form, { student_id: string }>;

export const registerStudent = async (
  prevState: null | RegisterStudentState,
  formData: FormData,
): Promise<RegisterStudentState> => {
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
    const data = z
      .object({
        name: z.string().transform(capitalizeName),
        national_id: z.string().min(8),
        birth_date: z.string().date(),
        parent_name: z
          .string()
          .nullish()
          .transform((x) => (x ? capitalizeName(x) : undefined)),
        parent_national_id: z.string().min(8).nullish(),
        email: z.string().email().toLowerCase(),
        hour_start: z.string().time(),
        hour_end: z.string().time(),
        days: z.set(z.enum(days)),
      })
      .parse({ ...form, days: new Set(form.days) });

    const is18Plus =
      (new Date().getTime() - new Date(data.birth_date).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25) >=
      18;

    if (
      !is18Plus &&
      !(Boolean(data.parent_name) && Boolean(data.parent_national_id))
    ) {
      return {
        success: false,
        error: 'Ingrese los datos del apoderado',
      };
    }

    const [user_exists] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.national_id, data.national_id));

    if (user_exists) {
      return {
        success: false,
        error: 'Ya tenemos un alumno con el mismo DNI',
      };
    }

    if (is18Plus) {
      data.parent_name = undefined;
      data.parent_national_id = undefined;
    }

    // Generate student ID
    const student_id = id();

    // Determine email based on parent presence
    const student_email = data.parent_name
      ? `user_${student_id}@palaistra.com.pe`
      : data.email;

    // 1. Register the student
    const studentData = {
      id: student_id,
      name: data.name,
      email: student_email,
    };

    await db
      .insert(schema.user)
      .values({ ...studentData, national_id: data.national_id });

    // Add student to Redis
    await redis.set(`email:${student_email}:user:id`, student_id);
    await redis.hset(`user:${student_id}`, studentData);
    await redis.sadd<Role>(`membership|${student_id}|${pdi_id}`, 'student');

    // Add student membership
    await db.insert(schema.membership).values({
      palaistra_id: pdi_id,
      user_id: student_id,
      roles: ['student'],
    });

    let parent_id;
    // 2. If parent exists, register parent
    if (data.parent_name) {
      const parent_email = data.email;
      const parent = await db.query.user.findFirst({
        where: (u, { eq, or }) =>
          or(
            eq(u.national_id, data.parent_national_id!),
            eq(u.email, parent_email),
          ),
      });

      if (parent) {
        parent_id = parent.id;
        if (!parent.national_id) {
          await db
            .update(schema.user)
            .set({
              national_id: data.parent_national_id!,
            })
            .where(eq(schema.user.id, parent.id));
        }
      } else {
        parent_id = id();
        const parentData = {
          id: parent_id,
          name: data.parent_name,
          email: parent_email,
        };

        // Insert parent
        await db
          .insert(schema.user)
          .values({ ...parentData, national_id: data.parent_national_id! });

        // Add parent to Redis
        await redis.set(`email:${parent_email}:user:id`, parent_id);
        await redis.hset(`user:${parent_id}`, parentData);
        await redis.sadd<Role>(`membership|${parent_id}|${pdi_id}`, 'parent');

        // Create parental relationship
        await db.insert(schema.parental).values({
          parent_id,
          student_id,
        });

        await db.insert(schema.membership).values({
          palaistra_id: pdi_id,
          user_id: parent_id,
          roles: ['parent'],
        });
      }
    }

    // create the schedule
    const schedule_id = id();
    await db.insert(schema.schedule).values({
      id: schedule_id,
      palaistra_id: pdi_id,
      sport: 'swimming',
      student_id: student_id,
      valid_from: '2025-01-06',
      valid_to: '2025-02-01',
    });

    await db.insert(schema.schedule_block).values({
      id: id(),
      schedule_id: schedule_id,
      days: Array.from(data.days).toSorted(compareDays),
      hour_end: data.hour_end,
      hour_start: data.hour_start,
    });

    return {
      success: true,
      data: {
        student_id,
      },
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
      form,
      error: msg,
    };
  }
};
