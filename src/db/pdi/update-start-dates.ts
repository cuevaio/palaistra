import { eq } from 'drizzle-orm';

import { db, schema } from '..';

const en = await db.select().from(schema.enrollment);
console.log(en);

await db
  .update(schema.enrollment)
  .set({ starts_at: '2025-01-06' })
  .where(eq(schema.enrollment.starts_at, '2025-01-01'));
