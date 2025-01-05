import Link from 'next/link';

import { db } from '@/db';
import { pdi_id } from '@/db/pdi/constants';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const revalidate = 10800; // revalidate every three hours

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
          {enrollments.map(
            ({ student, category, group, starts_at, ends_at }) => (
              <TableRow key={student.id} className="relative">
                <TableCell>
                  {student.name}
                  <Link className="absolute inset-0" href={`/${student.id}`} />
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
            ),
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
