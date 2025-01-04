import Link from 'next/link';

import { db } from '@/db';

import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';

type Params = Promise<{ palaistra_id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const Page = async (props: { params: Params; searchParams: SearchParams }) => {
  const params = await props.params;
  const palaistra_id = params.palaistra_id;

  const sports = await db.query.sport.findMany({
    where: (sport, { eq }) => eq(sport.palaistra_id, palaistra_id),
    with: {
      categories: true,
      groups: true,
    },
  });

  return (
    <div className="grow p-4">
      <div className="text-2xl">Deportes</div>

      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead># Categorías</TableHead>
            <TableHead># Grupos</TableHead>
            <TableHead># Alumnos</TableHead>
            <TableHead>Fecha de creación</TableHead>
            <TableHead>Fecha de actualización</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sports.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">
                <Link
                  className={cn(
                    buttonVariants({ variant: 'link' }),
                    'decoration-pink-400',
                  )}
                  href={`/${palaistra_id}/sports/${s.id}`}
                >
                  {s.id}
                </Link>
              </TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>
                <Link
                  className={cn(
                    buttonVariants({ variant: 'link' }),
                    'decoration-pink-400',
                  )}
                  href={`/${palaistra_id}/categories/?sport_id=${s.id}`}
                >
                  {s.category_count}
                </Link>
              </TableCell>
              <TableCell>{s.group_count}</TableCell>
              <TableCell>{s.student_count}</TableCell>
              <TableCell>{s.created_at.toLocaleDateString()}</TableCell>
              <TableCell>{s.updated_at.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
