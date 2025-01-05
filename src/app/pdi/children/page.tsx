import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { db } from '@/db';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Page = async () => {
  const auth = await getUserAndSession();
  if (!auth) redirect('/signin');

  const children = await db.query.parental.findMany({
    where: (p, { eq }) => eq(p.parent_id, auth?.user.id),
    with: {
      student: true,
    },
  });

  return (
    <div className="container mx-auto">
      <h1 className="mb-2 text-xl font-semibold">Alumnos</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {children.map(({ student }) => (
            <TableRow key={student.id} className="relative">
              <TableCell>
                {student.name}
                <Link className="absolute inset-0" href={`/${student.id}`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
