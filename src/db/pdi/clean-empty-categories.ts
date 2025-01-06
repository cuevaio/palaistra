import { notInArray } from 'drizzle-orm';

import { db, schema } from '..';

const all_enrollments = await db
  .selectDistinct({ category_id: schema.enrollment.category_id })
  .from(schema.enrollment)
  .groupBy(schema.enrollment.category_id);

console.log(all_enrollments.length);

await db.delete(schema.category).where(
  notInArray(
    schema.category.id,
    all_enrollments.map((x) => x.category_id),
  ),
);
