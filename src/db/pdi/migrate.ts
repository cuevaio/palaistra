import { id } from '@/lib/nanoid';
import { compareDays } from '@/lib/utils';

import { db, schema } from '..';
import { pdi_id } from './constants';

const enrollments = await db.query.enrollment.findMany({
  with: {
    group: true,
  },
});

await Promise.all(
  enrollments.map(async (x) => {
    try {
      const schedule_id = id();

      await db.insert(schema.schedule).values({
        id: schedule_id,
        palaistra_id: pdi_id,
        sport: 'swimming',
        student_id: x.student_id,
        valid_from: x.starts_at,
        valid_to: x.ends_at,
      });

      await db.insert(schema.schedule_block).values({
        id: id(),
        schedule_id,
        days: Array.from(new Set(x.group.schedule[0].days)).toSorted(
          compareDays,
        ),
        hour_start: x.group.schedule[0].start_time,
        hour_end: x.group.schedule[0].end_time,
      });
    } catch (error) {
      console.log(JSON.stringify(x));
      console.log(error);
    }
  }),
);
