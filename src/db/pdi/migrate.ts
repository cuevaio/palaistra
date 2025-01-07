import { id } from '@/lib/nanoid';

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
        days: Array.from(new Set(x.group.schedule[0].days)).toSorted((a, b) => {
          const dayOrder = {
            L: 0, // Lunes
            M: 1, // Martes
            X: 2, // Miércoles
            J: 3, // Jueves
            V: 4, // Viernes
            S: 5, // Sábado
            D: 6, // Domingo
          };
          return dayOrder[a] - dayOrder[b];
        }),
        hour_start: x.group.schedule[0].start_time,
        hour_end: x.group.schedule[0].end_time,
      });
    } catch (error) {
      console.log(JSON.stringify(x));
      console.log(error);
    }
  }),
);
