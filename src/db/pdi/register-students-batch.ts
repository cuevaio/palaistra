import { eq, or } from 'drizzle-orm';

import { Day, Role } from '@/lib/constants';
import { id } from '@/lib/nanoid';
import { compareDays } from '@/lib/utils';

import { db, schema } from '..';
import { redis } from '../redis';
import { pdi_id } from './constants';
import { students } from './students-batch';

async function registerStudent(data: {
  student_name: string;
  end_date: string;
  days: string;
  start_time: string;
  end_time: string;
  email: string;
  student_dni: string;
  parent_name: string;
}) {
  try {
    const [user_exists] = await db
      .select()
      .from(schema.user)
      .where(
        or(
          eq(
            schema.user.national_id,
            data.student_dni === '' ? '00000000' : data.student_dni,
          ),
          eq(schema.user.name, data.student_name),
          eq(
            schema.user.email,
            data.parent_name !== ''
              ? 'XXXXXXXXXXXXXXXXXX'
              : data.email === ''
                ? 'XDXDXDXDXD'
                : data.email,
          ),
        ),
      );

    if (user_exists) {
      if (!user_exists.national_id && data.student_dni !== '') {
        await db
          .update(schema.user)
          .set({
            national_id: data.student_dni,
          })
          .where(eq(schema.user.id, user_exists.id));
      }
      return;
    }
    console.log(data);
    // Generate student ID
    const student_id = id();

    // Determine email based on parent presence
    const student_email = data.parent_name
      ? `user_${student_id}@palaistra.com.pe`
      : data.email;

    // 1. Register the student
    const studentData = {
      id: student_id,
      name: data.student_name,
      email: student_email,
    };

    await db.insert(schema.user).values({
      ...studentData,
      national_id: data.student_dni === '' ? null : data.student_dni,
    });

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
          or(eq(u.name, data.parent_name), eq(u.email, parent_email)),
      });

      if (parent) {
        parent_id = parent.id;
      } else {
        parent_id = id();
        const parentData = {
          id: parent_id,
          name: data.parent_name,
          email: parent_email,
        };

        // Insert parent
        await db.insert(schema.user).values({ ...parentData });

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
      valid_to: data.end_date !== '' ? data.end_date : '2025-02-01',
    });

    await db.insert(schema.schedule_block).values({
      id: id(),
      schedule_id: schedule_id,
      days: (Array.from(new Set(data.days.split(','))) as Day[]).toSorted(
        compareDays,
      ),
      hour_end: data.end_time,
      hour_start: data.start_time,
    });
  } catch (error) {
    console.log(error);
    console.log(data);
  }
}

await Promise.all(
  students.map((s) =>
    registerStudent({
      ...s,
      email:
        s.email === ''
          ? 'temp_' +
            s.student_name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .split(' ')
              .join('_')
          : s.email,
    }),
  ),
);

console.log(students.length);
