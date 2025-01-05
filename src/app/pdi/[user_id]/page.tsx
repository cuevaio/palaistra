import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { db } from '@/db';
import { pdi_id } from '@/db/pdi/constants';

import { Label } from '@/components/ui/label';

import pdi_logo from '../pdi-logo.jpg';
import { Attendance } from './attedance';
import { MarkAttendance } from './mark-attendance';
import { QRCode } from './qr';

type Params = Promise<{ user_id: string }>;

export const generateStaticParams = async () => {
  const enrollments = await db.query.enrollment.findMany({
    where: (e, { eq, and }) => and(eq(e.palaistra_id, pdi_id)),
  });

  return enrollments.map((e) => ({ user_id: e.student_id }));
};

export const revalidate = 10800; // revalidate every three hours

const Page = async (props: { params: Params }) => {
  const params = await props.params;
  const { user_id } = params;

  const enrollment = await db.query.enrollment.findFirst({
    where: (e, { eq, and }) =>
      and(eq(e.student_id, user_id), eq(e.palaistra_id, pdi_id)),
    with: {
      student: true,
      group: true,
      category: true,
      sport: true,
      attendance: true,
    },
  });

  if (!enrollment) return notFound();

  const { student, category, group, attendance } = enrollment;

  return (
    <div className="mx-auto flex min-h-[110vh] max-w-md flex-col items-center">
      <Image
        src={pdi_logo}
        width={200}
        height={200}
        alt="PDI logo"
        className="-m-10"
      />
      <div className="w-64">
        <QRCode
          url={
            process.env.NODE_ENV === 'development'
              ? `http://pdi.localhost:3000/${user_id}`
              : `http://pdi.palaistra.com.pe/${user_id}`
          }
        />
      </div>
      <div className="my-4 flex flex-col items-center">
        <p className="text-xl font-bold">{student.name}</p>
        <p className="text-sm">
          {category.name} - {group.name}
        </p>
        {group.schedule.map((turno, idx) => (
          <p key={idx}>
            {turno.days.join(', ')} | {turno.start_time} - {turno.end_time}
          </p>
        ))}
        <div className="mt-2 grid grid-cols-2 justify-between gap-8">
          <div className="text-center">
            <Label className="text-xs">Fecha de inicio</Label>
            <p>{enrollment.starts_at}</p>
          </div>
          <div className="text-center">
            <Label className="text-xs">Fecha de término</Label>
            <p>{enrollment.ends_at}</p>
          </div>
        </div>
      </div>
      <Attendance
        start_date="2025-01-02"
        active_days={group.schedule[0].days}
        attendance={attendance.map((a) => ({
          id: a.id,
          date: a.taken_at,
          time: a.duration,
        }))}
      />

      <React.Suspense>
        <MarkAttendance student_id={user_id} />
      </React.Suspense>
    </div>
  );
};

export default Page;
