import Link from 'next/link';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { category } from '@/db/schema';

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
  const searchParams = await props.searchParams;
  const palaistra_id = params.palaistra_id;
  const sport_id = searchParams.sport_id;

  let where = eq(category.palaistra_id, palaistra_id);
  if (sport_id) {
    where = and(eq(category.sport_id, sport_id.toString()), where);
  }

  const categories = await db.query.category.findMany({
    where,
    with: {
      sport: true,
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
            <TableHead>Deporte</TableHead>
            <TableHead># Grupos</TableHead>
            <TableHead># Alumnos</TableHead>
            <TableHead>Fecha de creación</TableHead>
            <TableHead>Fecha de actualización</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">
                <Link
                  className={cn(
                    buttonVariants({ variant: 'link' }),
                    'decoration-pink-400',
                  )}
                  href={`/${palaistra_id}/categories/${c.id}`}
                >
                  {c.id}
                </Link>
              </TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.sport.name}</TableCell>
              <TableCell>{c.group_count}</TableCell>
              <TableCell>{c.student_count}</TableCell>
              <TableCell>{c.created_at.toLocaleDateString()}</TableCell>
              <TableCell>{c.updated_at.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
