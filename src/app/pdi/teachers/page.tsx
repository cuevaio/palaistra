import Link from 'next/link';

import { arrayContains } from 'drizzle-orm';

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

const Page = async () => {
  const memberships = await db.query.membership.findMany({
    where: (m, { eq, and }) =>
      and(eq(m.palaistra_id, pdi_id), arrayContains(m.roles, ['teacher'])),
    with: {
      user: true,
    },
  });

  return (
    <div className="container mx-auto">
      <h1 className="mb-2 text-xl font-semibold">Profesores</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profesor</TableHead>
            <TableHead>Correo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships
            .toSorted((a, b) => {
              if (a.user.name < b.user.name) {
                return -1;
              }
              if (a.user.name > b.user.name) {
                return 1;
              }
              return 0;
            })
            .map(
              ({ user, roles }) =>
                !roles.includes('admin') && (
                  <TableRow key={user.id} className="relative">
                    <TableCell>
                      {user.name}
                      <Link className="absolute inset-0" href={`/${user.id}`} />
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                ),
            )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;