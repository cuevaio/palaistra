import { Day, Role } from '@/lib/constants';
import { id } from '@/lib/nanoid';
import { resend } from '@/lib/resend';

import { db, schema } from '..';
import { redis } from '../redis';
import { EnrollmentInsert } from '../schema';
import { pdi_id, sport_id } from './constants';
import Welcome from './email';
import { createQR } from './store-qr';

type StudentRegistrationInput = {
  student_name: string;
  email: string;
  category: string;
  group: string;
  start_time: string;
  end_time: string;
  days: string;
  months: string;
  parent_name?: string;
};

// Function to parse month ranges and return start and end dates
function parseMonthsToDateRange(monthsStr: string) {
  const currentYear = 2025;
  const monthMap: { [key: string]: number } = {
    Ene: 0,
    Feb: 1,
    Mar: 2,
    Abr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Ago: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dic: 11,
  };

  const months = monthsStr.split('-').map((m) => m.trim());

  if (months.length === 1) {
    const monthNum = monthMap[months[0]];
    const startDate = new Date(currentYear, monthNum, 1);
    const endDate = new Date(currentYear, monthNum + 1, 0);
    return {
      starts_at: startDate.toISOString().split('T')[0],
      ends_at: endDate.toISOString().split('T')[0],
    };
  } else {
    const startMonth = monthMap[months[0]];
    const endMonth = monthMap[months[1]];
    const startDate = new Date(currentYear, startMonth, 1);
    const endDate = new Date(currentYear, endMonth + 1, 0);
    return {
      starts_at: startDate.toISOString().split('T')[0],
      ends_at: endDate.toISOString().split('T')[0],
    };
  }
}

async function registerStudent(input: StudentRegistrationInput) {
  // Generate student ID
  const student_id = id();

  // Determine email based on parent presence
  const student_email = input.parent_name
    ? `user_${student_id}@palaistra.com.pe`
    : input.email;

  // 1. Register the student
  const studentData = {
    id: student_id,
    name: input.student_name,
    email: student_email,
  };

  await db.insert(schema.user).values(studentData);

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
  if (input.parent_name) {
    const parent = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, input.email),
    });

    if (parent) {
      parent_id = parent.id;
    } else {
      parent_id = id();
      const parentData = {
        id: parent_id,
        name: input.parent_name,
        email: input.email,
      };

      // Insert parent
      await db.insert(schema.user).values(parentData);

      // Add parent to Redis
      await redis.set(`email:${input.email}:user:id`, parent_id);
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

  // 3. Check and create category if doesn't exist
  let category = await db.query.category.findFirst({
    where: (c, { eq, and }) =>
      and(eq(c.name, input.category), eq(c.palaistra_id, pdi_id)),
  });

  if (!category) {
    [category] = await db
      .insert(schema.category)
      .values({
        id: id(),
        name: input.category,
        palaistra_id: pdi_id,
        sport_id: sport_id,
      })
      .returning();
  }

  // 4. Check and create group if doesn't exist
  let group = await db.query.group.findFirst({
    where: (g, { eq, and }) =>
      and(eq(g.name, input.group), eq(g.category_id, category.id)),
  });

  if (!group) {
    const schedule = [
      {
        days: input.days.split(',').map((d) => d.trim()) as Day[],
        start_time: input.start_time,
        end_time: input.end_time,
      },
    ];

    [group] = await db
      .insert(schema.group)
      .values({
        id: id(),
        name: input.group,
        category_id: category.id,
        sport_id: sport_id,
        palaistra_id: pdi_id,
        schedule,
      })
      .returning();
  } else {
    if (
      group.schedule[0].days.join(',') !== input.days ||
      group.schedule[0].start_time !== input.start_time ||
      group.schedule[0].end_time !== input.end_time
    ) {
      const schedule = [
        {
          days: input.days.split(',').map((d) => d.trim()) as Day[],
          start_time: input.start_time,
          end_time: input.end_time,
        },
      ];

      [group] = await db
        .insert(schema.group)
        .values({
          id: id(),
          name: input.group + student_id,
          category_id: category.id,
          sport_id: sport_id,
          palaistra_id: pdi_id,
          schedule,
        })
        .returning();
    }
  }

  // 5. Create enrollment
  const { starts_at, ends_at } = parseMonthsToDateRange(input.months);

  const enrollment: EnrollmentInsert = {
    id: id(),
    student_id,
    palaistra_id: pdi_id,
    sport_id: sport_id,
    category_id: category.id,
    group_id: group.id,
    starts_at,
    ends_at,
  };

  await db.insert(schema.enrollment).values(enrollment);

  // 6. Generate QR and send welcome email
  const qr_url = await createQR(`https://pdi.palaistra.com.pe/${student_id}`);

  await resend.emails.send({
    from: 'PDI x Palaistra <pdi@updates.palaistra.com.pe>',
    to: [input.parent_name ? input.email : student_email],
    subject:
      '¡Bienvenidos a las Clases de Natación! [Información Importante]' +
      (input.parent_name ? ` [${input.student_name.split(' ')[0]}]` : ''),
    react: (
      <Welcome
        student_name={input.student_name}
        qr_url={qr_url!}
        parent_name={input.parent_name}
      />
    ),
  });

  return {
    student_id,
    email: student_email,
    parent_id: input.parent_name ? parent_id : undefined,
    enrollment_id: enrollment.id,
  };
}

await registerStudent({
  student_name: 'Dominic Ismael Arzola Peña',
  email: 'luz200384@hotmail.com',
  category: 'Niños',
  group: 'Dominical',
  months: 'Ene',
  days: 'D',
  start_time: '13:00',
  end_time: '15:00',
  parent_name: 'Luz de Maria Peña Sanchez',
});
