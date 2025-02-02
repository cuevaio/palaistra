import Link from 'next/link';

import { and, eq, ilike, or, sql, SQL } from 'drizzle-orm';
import { CalendarIcon, ClockIcon, ScanEyeIcon } from 'lucide-react';
import { z } from 'zod';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { ScheduleBlockSelect, ScheduleSelect, UserSelect } from '@/db/schema';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Day, days as DAYS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Filters } from './filters';
import { RenewMembership } from './renew-membership';

export const revalidate = 300; // revalidate every 5 minutes

type Params = Promise<{ palaistra_id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const Page = async (props: { params: Params; searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;

  // Add status filter parsing
  const statusSchema = z.enum(['active', 'inactive', 'all']).catch('all');
  const status = statusSchema.parse(searchParams.status);

  // Get current date in YYYY-MM-DD format matching the database
  const currentDate = new Date()
    .toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('/')
    .toReversed()
    .join('-');

  // Modify where clause to include status filter
  let whereClause: SQL<unknown> | undefined = eq(
    schema.schedule.palaistra_id,
    pdi_id,
  );

  if (status === 'active') {
    whereClause = and(
      whereClause,
      sql`${schema.schedule.valid_from} <= ${currentDate}`,
      sql`${schema.schedule.valid_to} >= ${currentDate}`,
    );
  } else if (status === 'inactive') {
    whereClause = and(
      whereClause,
      or(
        sql`${schema.schedule.valid_from} > ${currentDate}`,
        sql`${schema.schedule.valid_to} < ${currentDate}`,
      ),
    );
  }

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

  // Common selection logic for latest schedules
  const baseQuery = (additionalWhere?: SQL<unknown>) =>
    db
      .selectDistinctOn([schema.schedule.student_id])
      .from(schema.schedule)
      .leftJoin(schema.user, eq(schema.schedule.student_id, schema.user.id))
      .leftJoin(
        schema.schedule_block,
        eq(schema.schedule.id, schema.schedule_block.schedule_id),
      )
      .where(and(whereClause, additionalWhere))
      .orderBy(
        schema.schedule.student_id,
        sql`${schema.schedule.valid_from} desc`,
      );

  if (typeof searchParams.search === 'string') {
    if (days.length > 0) {
      const result = await baseQuery(
        and(
          ilike(schema.user.name, `%${searchParams.search}%`),
          or(
            ...days.map(
              (day) =>
                sql`'${sql.raw(day)}' = ANY(${schema.schedule_block.days})`,
            ),
          ),
        ),
      ).groupBy(schema.user.id, schema.schedule.id, schema.schedule_block.id);

      schedules = result.map(({ schedule, schedule_block, user }) => ({
        ...schedule,
        student: user!,
        blocks: [schedule_block!],
      }));
    } else {
      const result = await baseQuery(
        ilike(schema.user.name, `%${searchParams.search}%`),
      ).groupBy(schema.user.id, schema.schedule.id, schema.schedule_block.id);

      schedules = result.map(({ schedule, schedule_block, user }) => ({
        ...schedule,
        student: user!,
        blocks: [schedule_block!],
      }));
    }
  } else {
    if (days.length > 0) {
      const result = await baseQuery(
        or(
          ...days.map(
            (day) =>
              sql`'${sql.raw(day)}' = ANY(${schema.schedule_block.days})`,
          ),
        ),
      ).groupBy(schema.user.id, schema.schedule.id, schema.schedule_block.id);

      schedules = result.map(({ schedule, schedule_block, user }) => ({
        ...schedule,
        student: user!,
        blocks: [schedule_block!],
      }));
    } else {
      const result = await baseQuery().groupBy(
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
            <Card key={student.id} className="flex flex-col">
              <CardHeader className="items-top flex flex-row justify-between space-y-0 pb-2">
                <h3 className="flex-1 font-semibold">{student.name}</h3>

                {valid_from <=
                  new Date()
                    .toLocaleDateString('es-PE', {
                      year: 'numeric',

                      month: '2-digit',
                      day: '2-digit',
                    })
                    .split('/')
                    .toReversed()
                    .join('-') &&
                valid_to >=
                  new Date()
                    .toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                    .split('/')
                    .toReversed()
                    .join('-') ? (
                  <Badge className="ml-2 shrink-0">Activo</Badge>
                ) : (
                  <RenewMembership
                    student_id={student.id}
                    student_name={student.name}
                  />
                )}
              </CardHeader>
              <CardContent className="grow py-0">
                <div className="flex flex-col space-y-3 text-sm">
                  <div className="flex items-start text-muted-foreground">
                    <ClockIcon className="my-1 mr-2 h-4 w-4" />
                    {blocks.map((turno, idx) => (
                      <p key={idx}>
                        {turno.days.join(', ')} | {turno.hour_start.slice(0, 5)}{' '}
                        - {turno.hour_end.slice(0, 5)}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-start text-muted-foreground">
                    <CalendarIcon className="my-1 mr-2 h-4 w-4" />
                    <div>
                      <p>Inicio: {valid_from}</p>
                      <p>Término: {valid_to}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <Separator className="my-4" />
              <CardFooter>
                <Link
                  href={`/${student.id}`}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full',
                  )}
                >
                  <ScanEyeIcon className="h-4 w-4" />
                  Ver alumno
                </Link>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Page;
