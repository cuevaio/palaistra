import { notInArray } from 'drizzle-orm';

import { db, schema } from '..';

const all_enrollments = await db
  .selectDistinct({ group_id: schema.enrollment.group_id })
  .from(schema.enrollment)
  .groupBy(schema.enrollment.group_id);

console.log(all_enrollments.length);

await db.delete(schema.group).where(
  notInArray(
    schema.group.id,
    all_enrollments.map((x) => x.group_id),
  ),
);
