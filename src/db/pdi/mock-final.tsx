import Papa from 'papaparse';

import { Day, Role } from '@/lib/constants';
import { id } from '@/lib/nanoid';
import { resend } from '@/lib/resend';

import { db, schema } from '..';
import { redis } from '../redis';
import { EnrollmentInsert, MembershipInsert } from '../schema';
import { pdi_id } from './constants';
import Welcome from './email';
import { createQR } from './store-qr';

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

type CSVRow = {
  id: string;
  student_name: string;
  email: string;
  category: string;
  group: string;
  start_time: string;
  end_time: string;
  days: string;
  months: string;
  parent_name: string;
};

type StudentInfo = {
  name: string;
  email: string;
  id: string;
  months: string; // Store individual student's months
};

type GroupInfo = {
  schedule: { days: Day[]; start_time: string; end_time: string }[];
  students: StudentInfo[]; // Changed to store full student info including months
};

type CategoriesGroups = {
  [category: string]: {
    [group: string]: GroupInfo;
  };
};

async function populateDatabase() {
  // await redis.flushdb();

  // Create Palaistra
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
      id: 'DDDDDDDDDDDD',
    },
    {
      name: 'Anthony Cueva',
      email: 'hi@cueva.io',
      id: 'AAAAAAAAAAAA',
    },
    {
      name: 'Edson Rojas',
      email: 'edsonrojas93@gmail.com',
      id: '',
    },
  ];

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

  // Read and parse CSV using Bun
  const file = Bun.file('./pdi_db.csv');
  const fileContent = await file.text();

  let { data: csvData } = Papa.parse<CSVRow>(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  csvData = csvData.map((x) => ({ ...x, id: id() }));

  // Process students from CSV with their individual months
  const students = csvData.map((row) => {
    const parent_name =
      row.parent_name?.length > 0 ? row.parent_name : undefined;

    return {
      name: row.student_name,
      email: parent_name ? 'user_' + row.id + '@palaistra.com.pe' : row.email,
      id: row.id,
      months: row.months,
      parent_name,
      parent_email: parent_name ? row.email : undefined,
    };
  });

  // Insert students (without months in the database)
  await db
    .insert(schema.user)
    .values(students.map(({ name, email, id }) => ({ name, email, id })));
  await Promise.all(
    students.map(async (student) => {
      await redis.set(`email:${student.email}:user:id`, student.id);
      await redis.hset(`user:${student.id}`, {
        name: student.name,
        email: student.email,
        id: student.id,
      });
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

  const parents = new Map<string, { children: string[]; name: string }>();
  students.forEach((st) => {
    if (!st.parent_email) return;
    if (parents.has(st.parent_email)) {
      parents.set(st.parent_email, {
        children: [...parents.get(st.parent_email)!.children, st.id],
        name: parents.get(st.parent_email)!.name ?? st.parent_name,
      });
    } else {
      parents.set(st.parent_email, {
        children: [st.id],
        name: st.parent_name!,
      });
    }
  });

  const ppp = [...parents].map(([email, { children, name }]) => ({
    name,
    email,
    id: id(),
    children,
  }));

  // Insert parents
  await db
    .insert(schema.user)
    .values(ppp.map((x) => ({ id: x.id, name: x.name, email: x.email })));

  await Promise.all(
    ppp.map(async (parent) => {
      await redis.set(`email:${parent.email}:user:id`, parent.id);
      await redis.hset(`user:${parent.id}`, {
        name: parent.name,
        email: parent.email,
        id: parent.id,
      });
      await redis.sadd<Role>(
        `membership|${parent.id}|${palaistra.id}`,
        'parent',
      );
    }),
  );

  await Promise.all(
    ppp.map(async (parent) => {
      await db.insert(schema.parental).values(
        parent.children.map((c) => ({
          parent_id: parent.id,
          student_id: c,
        })),
      );
    }),
  );

  // SPORT
  const [sport] = await db
    .insert(schema.sport)
    .values({ id: id(), name: 'Natación', palaistra_id: palaistra.id })
    .returning();

  // Process categories and groups from CSV
  const categoriesGroups = csvData.reduce<CategoriesGroups>((acc, row) => {
    if (!acc[row.category]) {
      acc[row.category] = {};
    }
    if (!acc[row.category][row.group]) {
      acc[row.category][row.group] = {
        schedule: [
          {
            days: row.days.split(',').map((d) => d.trim()) as Day[],
            start_time: row.start_time,
            end_time: row.end_time,
          },
        ],
        students: [],
      };
    }

    // Find the corresponding student with their months
    const studentInfo = students.find((s) => s.id === row.id);
    if (studentInfo) {
      acc[row.category][row.group].students.push(studentInfo);
    }

    return acc;
  }, {});

  const categories = await db
    .insert(schema.category)
    .values(
      Object.keys(categoriesGroups).map((category) => ({
        id: id(),
        name: category,
        palaistra_id: palaistra.id,
        sport_id: sport.id,
      })),
    )
    .returning();

  await Promise.all(
    categories.map(async (category) => {
      Object.entries(categoriesGroups[category.name]).map(
        async ([group_name, { schedule, students }]) => {
          const group_id = id();
          const group = {
            id: group_id,
            name: group_name,
            category_id: category.id,
            sport_id: sport.id,
            palaistra_id: palaistra.id,
            schedule,
          };

          // Create enrollments with individual date ranges for each student
          const enrollments: EnrollmentInsert[] = students.map((student) => {
            const { starts_at, ends_at } = parseMonthsToDateRange(
              student.months,
            );
            return {
              id: id(),
              student_id: student.id,
              palaistra_id: palaistra.id,
              sport_id: sport.id,
              category_id: category.id,
              group_id: group_id,
              starts_at,
              ends_at,
            };
          });

          await Promise.all([
            await db.insert(schema.group).values(group),
            await db.insert(schema.enrollment).values(enrollments),
          ]);
        },
      );
    }),
  );

  const qrs = await Promise.all(
    students.map(async (student) => {
      const qr_url = await createQR(
        `https://pdi.palaistra.com.pe/${student.id}`,
      );

      return {
        id: student.id,
        qr_url,
      };
    }),
  );

  await resend.batch.send(
    students.map((student) => ({
      from: 'PDI x Palaistra <pdi@updates.palaistra.com.pe>',
      to: [student.parent_email || student.email],
      subject:
        '¡Bienvenidos a las Clases de Natación! [Información Importante]' +
        (student.parent_email ? ' [' + student.name.split(' ')[0] + ']' : ''),
      react: (
        <Welcome
          student_name={student.name}
          qr_url={qrs.find((q) => q.id === student.id)!.qr_url!}
          parent_name={student.parent_name}
        />
      ),
    })),
  );
}

// Execute the population
populateDatabase().catch(console.error);
