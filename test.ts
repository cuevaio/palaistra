import { and, eq, exists, or, sql } from 'drizzle-orm';

import { db } from '@/db';
import { schedule, schedule_block, user } from '@/db/schema';

const resultOR = await db
  .selectDistinct()
  .from(user)
  .innerJoin(schedule, eq(schedule.student_id, user.id))
  .innerJoin(schedule_block, eq(schedule_block.schedule_id, schedule.id))
  .where(
    or(
      sql`'D' = ANY(${schedule_block.days})`,
      sql`'S' = ANY(${schedule_block.days})`,
    ),
  )
  .groupBy(user.id, schedule.id, schedule_block.id);

console.log(resultOR);

const resultAND = await db
  .selectDistinct()
  .from(user)
  .innerJoin(schedule, eq(schedule.student_id, user.id))
  .innerJoin(schedule_block, eq(schedule_block.schedule_id, schedule.id))
  .where(
    and(
      sql`'L' = ANY(${schedule_block.days})`,
      exists(
        db
          .select({ one: sql`1` })
          .from(schedule_block)
          .where(
            and(
              eq(schedule_block.schedule_id, schedule.id),
              sql`'X' = ANY(${schedule_block.days})`,
            ),
          ),
      ),
      exists(
        db
          .select({ one: sql`1` })
          .from(schedule_block)
          .where(
            and(
              eq(schedule_block.schedule_id, schedule.id),
              sql`'V' = ANY(${schedule_block.days})`,
            ),
          ),
      ),
    ),
  )
  .groupBy(user.id, schedule.id, schedule_block.id);

console.log(resultAND);
