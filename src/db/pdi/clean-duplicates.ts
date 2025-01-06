import { db, schema } from '..';

const all_students = await db.select().from(schema.user);

const unique_names = new Set<string>();

all_students.forEach((s) => unique_names.add(s.name));

console.log(unique_names.size);

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

    console.log(st);
  }),
);
