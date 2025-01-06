import { eq } from 'drizzle-orm';

import { db, schema } from '..';

const unique_groups = await db
  .selectDistinct({ schedule: schema.group.schedule })
  .from(schema.group)
  .groupBy(schema.group.schedule);

unique_groups.forEach(console.log);

const all_groups = await db.select().from(schema.group);

const group_mapping: { [old_id: string]: string } = {};
const category_mapping: { [old_id: string]: string } = {};

all_groups.forEach((g) => {
  const gg = all_groups
    .filter((x) => JSON.stringify(x.schedule) === JSON.stringify(g.schedule))
    .toSorted((a, b) => {
      if (a.created_at < b.created_at) {
        return -1;
      }
      if (a.created_at > b.created_at) {
        return 1;
      }
      return 0;
    });
  const f = gg.shift();
  group_mapping[g.id] = f!.id;
  category_mapping[g.category_id] = f!.category_id;
});

console.log(category_mapping);

const attendance_r = await db.select().from(schema.attendance);
await Promise.all(
  attendance_r.map(async (a) => {
    await db
      .update(schema.attendance)
      .set({
        category_id: category_mapping[a.category_id],
        group_id: group_mapping[a.group_id],
      })
      .where(eq(schema.attendance.id, a.id));
  }),
);

const enrollment_r = await db.select().from(schema.enrollment);
await Promise.all(
  enrollment_r.map(async (e) => {
    await db
      .update(schema.enrollment)
      .set({
        category_id: category_mapping[e.category_id],
        group_id: group_mapping[e.group_id],
      })
      .where(eq(schema.enrollment.id, e.id));
  }),
);
