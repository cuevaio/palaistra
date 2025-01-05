import { Role } from '@/lib/constants';

import { db, schema } from '..';
import { redis } from '../redis';
import { MembershipInsert } from '../schema';
import { pdi_id } from './constants';

const admins: {
  name: string;
  email: string;
  id: string;
}[] = [
  {
    name: 'Edson Rojas',
    email: 'edsonrojas93@gmail.com',
    id: 'EEEEEEEEEEEE',
  },
];

await db.insert(schema.user).values(admins);
await db.insert(schema.membership).values(
  admins.map(
    (admin) =>
      ({
        palaistra_id: pdi_id,
        user_id: admin.id,
        roles: ['admin', 'teacher'],
      }) satisfies MembershipInsert,
  ),
);

await Promise.all(
  admins.map(async (admin) => {
    await redis.set(`email:${admin.email}:user:id`, admin.id);
    await redis.hset(`user:${admin.id}`, admin);
    await redis.sadd<Role>(
      `membership|${admin.id}|${pdi_id}`,
      'admin',
      'teacher',
    );
  }),
);
