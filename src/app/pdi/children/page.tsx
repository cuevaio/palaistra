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
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
                <Link
                  className={cn(buttonVariants({ variant: 'link' }))}
                  href={`/${student.id}`}
                >
                  {student.name}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
