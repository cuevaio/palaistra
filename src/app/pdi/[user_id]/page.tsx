import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { db } from '@/db';
import { pdi_id } from '@/db/pdi/constants';

import { Label } from '@/components/ui/label';

import pdi_logo from '../pdi-logo.jpg';
import { Attendance } from './attendance';
import { QRCode } from './qr';

type Params = Promise<{ user_id: string }>;

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
    },
  });
  if (!enrollment) return notFound();

  const { student, category, group } = enrollment;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
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
      </div>

      <React.Suspense>
        <Attendance user_id={user_id} />
      </React.Suspense>

      <div className="mt-12 grid grid-cols-2 justify-between gap-8 text-xs">
        <div>
          <Label>Fecha de inicio</Label>
          <p>{enrollment.starts_at}</p>
        </div>
        <div>
          <Label>Fecha de término</Label>
          <p>{enrollment.ends_at}</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
