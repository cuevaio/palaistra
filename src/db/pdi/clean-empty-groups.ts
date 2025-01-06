import { inArray } from 'drizzle-orm';

import { db, schema } from '..';

const all_students = await db.select().from(schema.user);

const unique_names = new Set<string>();

all_students.forEach((s) => unique_names.add(s.name));

console.log(unique_names.size);

const to_remove: string[] = [];

await Promise.all(
  Array.from(unique_names).map(async (name) => {
    const st = all_students
      .filter((x) => x.name === name)
      .toSorted((a, b) => {
        if (a.created_at < b.created_at) {
          return -1;
        }
        if (a.created_at > b.created_at) {
          return 1;
        }
        return 0;
      });
    if (st.length > 1) {
      st.pop();
      st.forEach((x) => {
        to_remove.push(x.id);
      });
    }
  }),
);

console.log(to_remove.length);

await db
  .delete(schema.attendance)
  .where(inArray(schema.attendance.student_id, to_remove));
await db
  .delete(schema.enrollment)
  .where(inArray(schema.enrollment.student_id, to_remove));
await db
  .delete(schema.membership)
  .where(inArray(schema.membership.user_id, to_remove));
await db
  .delete(schema.parental)
  .where(inArray(schema.parental.student_id, to_remove));

await db.delete(schema.user).where(inArray(schema.user.id, to_remove));
