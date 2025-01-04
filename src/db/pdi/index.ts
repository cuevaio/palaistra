import { Day, Role } from '@/lib/constants';
import { id } from '@/lib/nanoid';

import { db, schema } from '..';
import { redis } from '../redis';
import { EnrollmentInsert, MembershipInsert } from '../schema';
import { pdi_id } from './constants';

const [palaistra] = await db
  .insert(schema.palaistra)
  .values({
    id: pdi_id,
    name: 'PDI',
    handle: 'pdi',
  })
  .returning();

// ADMINS

const admins: {
  name: string;
  email: string;
  id: string;
}[] = [
  {
    name: 'Diego Alarcón',
    email: 'diego.alarcon@utec.edu.pe',
  },
  {
    name: 'Anthony Cueva',
    email: 'hi@cueva.io',
  },
].map((x) => ({ ...x, id: id() }));

await db.insert(schema.user).values(admins);

await db.insert(schema.membership).values(
  admins.map(
    (admin) =>
      ({
        palaistra_id: palaistra.id,
        user_id: admin.id,
        roles: ['admin', 'teacher'],
      }) satisfies MembershipInsert,
  ),
);

await Promise.all(
  admins.map(async (admin) => {
    await redis.set(`email:${admin.email}:user:id`, admin.id);
    await redis.hset(`user:${admin.id}`, admin);
    await redis.sadd<Role>(
      `membership|${admin.id}|${palaistra.id}`,
      'admin',
      'teacher',
    );
  }),
);

// STUDENTS

const students: {
  name: string;
  email: string;
  id: string;
}[] = [
  {
    name: 'Anthony Cueva',
    email: 'hi.cuevantn@gmail.com',
  },
  {
    name: 'Andrea Cueva',
    email: 'cuevaparedesa@gmail.com',
  },
].map((x) => ({ ...x, id: id() }));

await db.insert(schema.user).values(students);
await Promise.all(
  students.map(async (student) => {
    await redis.set(`email:${student.email}:user:id`, student.id);
    await redis.hset(`user:${student.id}`, student);
    await redis.sadd<Role>(
      `membership|${student.id}|${palaistra.id}`,
      'student',
    );
  }),
);
await db.insert(schema.membership).values(
  students.map(
    (student) =>
      ({
        palaistra_id: palaistra.id,
        user_id: student.id,
        roles: ['student'],
      }) satisfies MembershipInsert,
  ),
);

// SPORT
const [sport] = await db
  .insert(schema.sport)
  .values({ id: id(), name: 'Natación', palaistra_id: palaistra.id })
  .returning();

// xxxxx
const categories_groups: {
  [category: string]: {
    [group: string]: {
      schedule: { days: Day[]; start_time: string; end_time: string }[];
      students: string[];
    };
  };
} = {
  Adultos: {
    Mediodía: {
      schedule: [
        {
          days: ['D'],
          start_time: '12:00',
          end_time: '14:00',
        },
      ],
      students: ['cuevaparedesa@gmail.com'],
    },
  },
  'Equipo B': {
    Mañana: {
      schedule: [
        {
          days: ['L', 'M', 'X', 'J', 'V'],
          start_time: '09:00',
          end_time: '11:00',
        },
      ],
      students: ['hi.cuevantn@gmail.com'],
    },
  },
};

const categories = await db
  .insert(schema.category)
  .values(
    Object.keys(categories_groups).map((category) => ({
      id: id(),
      name: category,
      palaistra_id: palaistra.id,
      sport_id: sport.id,
    })),
  )
  .returning();

await Promise.all(
  categories.map(async (category) => {
    Object.entries(categories_groups[category.name]).map(
      async ([group_name, { schedule, students: emails }]) => {
        const group_id = id();
        const group = {
          id: group_id,
          name: group_name,
          category_id: category.id,
          sport_id: sport.id,
          palaistra_id: palaistra.id,
          schedule,
        };

        const enrollments: EnrollmentInsert[] = emails.map((e) => ({
          id: id(),
          student_id: students.find((s) => s.email === e)!.id,
          palaistra_id: palaistra.id,
          sport_id: sport.id,
          category_id: category.id,
          group_id: group_id,
          starts_at: '2025-01-01',
          ends_at: '2025-03-01',
        }));

        await Promise.all([
          await db.insert(schema.group).values(group),
          await db.insert(schema.enrollment).values(enrollments),
        ]);
      },
    );
  }),
);
