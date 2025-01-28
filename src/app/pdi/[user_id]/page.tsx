import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { logout } from '@/app/(auth)/logout.action';
import { and, eq } from 'drizzle-orm';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import pdi_logo from '../logo-pdi.jpg';
import { Attendance } from './attedance';
import { AttendanceTeachers } from './attedance-teachers';
import { MarkAttendanceStudents } from './mark-attendance-students';
import { MarkAttendanceTeachers } from './mark-attendance-teachers';
import { QRCode } from './qr';
import { UpdateSchedule } from './update-schedule';

type Params = Promise<{ user_id: string }>;

export const generateStaticParams = async () => {
  const schedules = await db.query.schedule.findMany({
    where: (e, { eq, and }) => and(eq(e.palaistra_id, pdi_id)),
  });

  return schedules.map((e) => ({ user_id: e.student_id }));
};

export const revalidate = 10800; // revalidate every three hours

const Page = async (props: { params: Params }) => {
  const params = await props.params;
  const { user_id } = params;

  const membership = await db.query.membership.findFirst({
    where: () =>
      and(
        eq(schema.membership.user_id, user_id),
        eq(schema.membership.palaistra_id, pdi_id),
      ),
    with: {
      user: true,
    },
  });

  if (!membership?.user) return notFound();

  if (membership.roles.includes('teacher')) {
    const teacher = membership.user;

    const attendance = await db.query.teacher_attendance.findMany({
      where: (a, { eq, and }) =>
        and(eq(a.palaistra_id, pdi_id), eq(a.teacher_id, teacher.id)),
      orderBy: (a, { desc }) => desc(a.created_at),
    });

    return (
      <div className="mx-auto flex min-h-[110vh] max-w-md flex-col items-center">
        <Image
          src={pdi_logo}
          width={150}
          height={150}
          alt="PDI logo"
          className="m-10"
        />
        <div className="w-64">
          <QRCode url={`http://pdi.palaistra.com.pe/${teacher.id}`} />
        </div>
        <div className="my-4 flex flex-col items-center">
          <p className="text-xl font-bold">{teacher.name}</p>
          <p>Profesor</p>
        </div>
        <AttendanceTeachers
          attendance={attendance.map((x) => ({
            id: x.id,
            date: x.taken_at,
            time: x.duration,
          }))}
        />
        <React.Suspense>
          <MarkAttendanceTeachers teacher_id={teacher.id} />
        </React.Suspense>

        <form action={logout}>
          <Button type="submit" className="my-8" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </div>
    );
  } else {
    const schedule = await db.query.schedule.findFirst({
      where: (e, { eq, and }) =>
        and(eq(e.student_id, user_id), eq(e.palaistra_id, pdi_id)),
      with: {
        blocks: true,
      },
    });

    if (!schedule) return notFound();

    const attendance = await db.query.attendance.findMany({
      where: (e, { eq, and }) =>
        and(eq(e.student_id, user_id), eq(e.palaistra_id, pdi_id)),
    });

    const student = membership.user;

    return (
      <div className="mx-auto flex min-h-[110vh] max-w-md flex-col items-center">
        <Image
          src={pdi_logo}
          width={150}
          height={150}
          alt="PDI logo"
          className="m-10"
        />
        <div className="w-64">
          <QRCode url={`http://pdi.palaistra.com.pe/${user_id}`} />
        </div>
        <p className="text-xs">
          Fecha de registro:{' '}
          {new Date(student.created_at + 'Z').toLocaleString('es-PE', {
            timeZone: 'Europe/Paris',
          })}
        </p>
        <div className="my-4 flex flex-col items-center">
          <p className="text-xl font-bold">{student.name}</p>
          {schedule.blocks.map((turno, idx) => (
            <p key={idx}>
              {turno.days.join(', ')} | {turno.hour_start.slice(0, 5)} -{' '}
              {turno.hour_end.slice(0, 5)}
            </p>
          ))}
          <UpdateSchedule schedule={schedule} />
          <div className="mt-2 grid grid-cols-2 justify-between gap-8">
            <div className="text-center">
              <Label className="text-xs">Fecha de inicio</Label>
              <p>{schedule.valid_from}</p>
            </div>
            <div className="text-center">
              <Label className="text-xs">Fecha de término</Label>
              <p>{schedule.valid_to}</p>
            </div>
          </div>
        </div>
        <Attendance
          start_date={schedule.valid_from}
          active_days={schedule.blocks[0].days}
          attendance={attendance.map((a) => ({
            id: a.id,
            date: a.taken_at,
            time: a.duration,
          }))}
        />

        <React.Suspense>
          <MarkAttendanceStudents />
        </React.Suspense>

        <form action={logout}>
          <Button type="submit" className="my-8" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </div>
    );
  }
};

export default Page;
