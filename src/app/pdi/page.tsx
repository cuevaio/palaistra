import Link from 'next/link';

import { and, eq, exists, ilike, or, sql, SQL } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { ScheduleBlockSelect, ScheduleSelect, UserSelect } from '@/db/schema';

import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Day, days as DAYS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Filters } from './filters';

export const revalidate = 300; // revalidate every 5 minutes

type Params = Promise<{ palaistra_id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const Page = async (props: { params: Params; searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  console.log(searchParams);

  let schedules: (ScheduleSelect & {
    student: UserSelect;
    blocks: ScheduleBlockSelect[];
  })[] = [];

  let days: Day[] = [];
  if (searchParams.days) {
    const { success, data } = z
      .set(z.enum(DAYS))
      .safeParse(new Set((searchParams.days as string).split('')));
    if (success) {
      days = Array.from(data);
    }
  }

  console.log(days);

  const isAndOperation = searchParams.op === 'AND';
  const whereClause: SQL<unknown> = eq(schema.schedule.palaistra_id, pdi_id);

  console.log(isAndOperation);

  if (typeof searchParams.search === 'string') {
    if (days.length > 0) {
      if (isAndOperation) {
        // AND logic
        const result = await db
          .selectDistinct()
          .from(schema.schedule)
          .leftJoin(schema.user, eq(schema.schedule.student_id, schema.user.id))
          .leftJoin(
            schema.schedule_block,
            eq(schema.schedule.id, schema.schedule_block.schedule_id),
          )
          .where(
            and(
              whereClause,
              ilike(schema.user.name, `%${searchParams.search}%`),
              ...days.map((day) =>
                exists(
                  db
                    .select({ one: sql`1` })
                    .from(schema.schedule_block)
                    .where(
                      and(
                        eq(
                          schema.schedule_block.schedule_id,
                          schema.schedule.id,
                        ),
                        sql`'${sql.raw(day)}' = ANY(${schema.schedule_block.days})`,
                      ),
                    ),
                ),
              ),
            ),
          )
          .groupBy(
            schema.user.id,
            schema.schedule.id,
            schema.schedule_block.id,
          );

        schedules = result.map(({ schedule, schedule_block, user }) => ({
          ...schedule,
          student: user!,
          blocks: [schedule_block!],
        }));
      } else {
        // OR logic
        const result = await db
          .selectDistinct()
          .from(schema.schedule)
          .leftJoin(schema.user, eq(schema.schedule.student_id, schema.user.id))
          .leftJoin(
            schema.schedule_block,
            eq(schema.schedule.id, schema.schedule_block.schedule_id),
          )
          .where(
            and(
              whereClause,
              ilike(schema.user.name, `%${searchParams.search}%`),
              or(
                ...days.map(
                  (day) =>
                    sql`'${sql.raw(day)}' = ANY(${schema.schedule_block.days})`,
                ),
              ),
            ),
          )
          .groupBy(
            schema.user.id,
            schema.schedule.id,
            schema.schedule_block.id,
          );

        schedules = result.map(({ schedule, schedule_block, user }) => ({
          ...schedule,
          student: user!,
          blocks: [schedule_block!],
        }));
      }
    } else {
      // No days filter, just search
      const result = await db
        .selectDistinct()
        .from(schema.schedule)
        .leftJoin(schema.user, eq(schema.schedule.student_id, schema.user.id))
        .leftJoin(
          schema.schedule_block,
          eq(schema.schedule.id, schema.schedule_block.schedule_id),
        )
        .where(
          and(whereClause, ilike(schema.user.name, `%${searchParams.search}%`)),
        )
        .groupBy(schema.user.id, schema.schedule.id, schema.schedule_block.id);

      schedules = result.map(({ schedule, schedule_block, user }) => ({
        ...schedule,
        student: user!,
        blocks: [schedule_block!],
      }));
    }
  } else {
    if (days.length > 0) {
      if (isAndOperation) {
        // AND logic without search
        const result = await db
          .selectDistinct()
          .from(schema.schedule)
          .leftJoin(schema.user, eq(schema.schedule.student_id, schema.user.id))
          .leftJoin(
            schema.schedule_block,
            eq(schema.schedule.id, schema.schedule_block.schedule_id),
          )
          .where(
            and(
              whereClause,
              ...days.map((day) =>
                exists(
                  db
                    .select({ one: sql`1` })
                    .from(schema.schedule_block)
                    .where(
                      and(
                        eq(
                          schema.schedule_block.schedule_id,
                          schema.schedule.id,
                        ),
                        sql`'${sql.raw(day)}' = ANY(${schema.schedule_block.days})`,
                      ),
                    ),
                ),
              ),
            ),
          )
          .groupBy(
            schema.user.id,
            schema.schedule.id,
            schema.schedule_block.id,
          );

        schedules = result.map(({ schedule, schedule_block, user }) => ({
          ...schedule,
          student: user!,
          blocks: [schedule_block!],
        }));
      } else {
        // OR logic without search
        console.log('hi');
        const result = await db
          .selectDistinct()
          .from(schema.schedule)
          .leftJoin(schema.user, eq(schema.schedule.student_id, schema.user.id))
          .leftJoin(
            schema.schedule_block,
            eq(schema.schedule.id, schema.schedule_block.schedule_id),
          )
          .where(
            and(
              whereClause,
              or(
                ...days.map(
                  (day) =>
                    sql`'${sql.raw(day)}' = ANY(${schema.schedule_block.days})`,
                ),
              ),
            ),
          )
          .groupBy(
            schema.user.id,
            schema.schedule.id,
            schema.schedule_block.id,
          );

        schedules = result.map(({ schedule, schedule_block, user }) => ({
          ...schedule,
          student: user!,
          blocks: [schedule_block!],
        }));
      }
    } else {
      // No filters at all
      const result = await db
        .selectDistinct()
        .from(schema.schedule)
        .leftJoin(schema.user, eq(schema.schedule.student_id, schema.user.id))
        .leftJoin(
          schema.schedule_block,
          eq(schema.schedule.id, schema.schedule_block.schedule_id),
        )
        .where(whereClause)
        .groupBy(schema.user.id, schema.schedule.id, schema.schedule_block.id);

      schedules = result.map(({ schedule, schedule_block, user }) => ({
        ...schedule,
        student: user!,
        blocks: [schedule_block!],
      }));
    }
  }

  return (
    <div className="container mx-auto my-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="mb-2 text-xl font-semibold">Alumnos</h1>
      </div>
      <div className="div flex justify-between">
        <Link
          href="/students"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Invitaciones
        </Link>
        <Link
          href="/students/register"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Registrar alumno
        </Link>
      </div>
      <Filters />
      <div>{schedules.length} alumnos</div>
      <Table className="text-xs md:text-base">
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead className="hidden md:block">Fecha de inicio</TableHead>
            <TableHead className="hidden md:block">Fecha de término</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules
            .toSorted((a, b) => {
              if (a.student.name < b.student.name) {
                return -1;
              }
              if (a.student.name > b.student.name) {
                return 1;
              }
              return 0;
            })
            .map(({ student, valid_from, valid_to, blocks }) => (
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
                  {blocks.map((turno, idx) => (
                    <p key={idx}>
                      {turno.days.join(', ')} | {turno.hour_start.slice(0, 5)} -{' '}
                      {turno.hour_end.slice(0, 5)}
                    </p>
                  ))}
                </TableCell>
                <TableCell className="hidden md:block">{valid_from}</TableCell>
                <TableCell className="hidden md:block">{valid_to}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
