import Link from 'next/link';

import { db } from '@/db';
import { pdi_id } from '@/db/pdi/constants';

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

export const revalidate = 300; // revalidate every 5 minutes

const Page = async () => {
  const enrollments = await db.query.enrollment.findMany({
    where: (m, { eq }) => eq(m.palaistra_id, pdi_id),
    with: {
      student: true,
      group: true,
      category: true,
    },
  });

  return (
    <div className="container mx-auto">
      <h1 className="mb-2 text-xl font-semibold">Alumnos</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Categoría - Grupo</TableHead>
            <TableHead>Turno</TableHead>
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
                  {category.name} - {group.name}
                </TableCell>
                <TableCell>
                  {group.schedule.map((turno, idx) => (
                    <p key={idx}>
                      {turno.days.join(', ')} | {turno.start_time} -{' '}
                      {turno.end_time}
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
