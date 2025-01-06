import Link from 'next/link';

import { and, eq, ilike, SQL } from 'drizzle-orm';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import {
  CategorySelect,
  EnrollmentSelect,
  GroupSelect,
  UserSelect,
} from '@/db/schema';

import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';

import { Filters } from './filters';

export const revalidate = 300; // revalidate every 5 minutes

type Params = Promise<{ palaistra_id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const Page = async (props: { params: Params; searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;

  let enrollments: (EnrollmentSelect & {
    student: UserSelect;
    group: GroupSelect;
    category: CategorySelect;
  })[] = [];

  let whereClause: SQL<unknown> = eq(schema.enrollment.palaistra_id, pdi_id);

  if (typeof searchParams.group === 'string') {
    whereClause = and(
      whereClause,
      eq(schema.enrollment.group_id, searchParams.group),
    ) as SQL<unknown>;
  }

  if (typeof searchParams.search === 'string') {
    const _enrollments = await db
      .select()
      .from(schema.enrollment)
      .leftJoin(schema.user, eq(schema.enrollment.student_id, schema.user.id))
      .leftJoin(
        schema.category,
        eq(schema.enrollment.category_id, schema.category.id),
      )
      .leftJoin(schema.group, eq(schema.enrollment.group_id, schema.group.id))
      .where(
        and(whereClause, ilike(schema.user.name, `%${searchParams.search}%`)),
      );
    enrollments = _enrollments.map(({ enrollment, user, category, group }) => ({
      ...enrollment,
      student: user!,
      category: category!,
      group: group!,
    }));
  } else {
    enrollments = await db.query.enrollment.findMany({
      where: () => whereClause,
      with: {
        student: true,
        group: true,
        category: true,
      },
    });
  }

  const groups = await db.query.group.findMany({
    where: () => eq(schema.group.palaistra_id, pdi_id),
    with: {
      category: true,
    },
  });

  return (
    <div className="container mx-auto">
      <h1 className="mb-2 text-xl font-semibold">Alumnos</h1>
      <Filters
        groups={groups.toSorted((a, b) => {
          if (a.category.name < b.category.name) {
            return -1;
          }
          if (a.category.name > b.category.name) {
            return 1;
          }
          return 0;
        })}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Fecha de inicio</TableHead>
            <TableHead>Fecha de término</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments
            .toSorted((a, b) => {
              if (a.student.name < b.student.name) {
                return -1;
              }
              if (a.student.name > b.student.name) {
                return 1;
              }
              return 0;
            })
            .map(({ student, category, group, starts_at, ends_at }) => (
              <TableRow key={student.id} className="relative">
                <TableCell>
                  <Link
                    className={cn(buttonVariants({ variant: 'link' }))}
                    href={`/${student.id}`}
                  >
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {group.schedule.map((turno, idx) => (
                    <p key={idx}>
                      {category.name} | {turno.days.join(', ')} |{' '}
                      {turno.start_time} - {turno.end_time}
                    </p>
                  ))}
                </TableCell>
                <TableCell>{starts_at}</TableCell>
                <TableCell>{ends_at}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
