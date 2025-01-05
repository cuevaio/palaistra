import { relations } from 'drizzle-orm';
import {
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { days, roles } from '@/lib/constants';

export const role_enum = pgEnum('role', roles);
export const day_enum = pgEnum('day', days);

// Tables definition
export const user = pgTable('user', {
  id: varchar('id', { length: 12 }).primaryKey(),

  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),

  created_at: timestamp('created_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  memberships: many(membership),
}));

export const membership = pgTable(
  'membership',
  {
    user_id: varchar('user_id', { length: 12 })
      .references(() => user.id)
      .notNull(),
    palaistra_id: varchar('palaistra_id', { length: 12 })
      .references(() => palaistra.id)
      .notNull(),

    roles: role_enum('role').array().notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.palaistra_id] }),
  }),
);

export const membershipRelations = relations(membership, ({ one }) => ({
  user: one(user, {
    fields: [membership.user_id],
    references: [user.id],
  }),
  palaistra: one(palaistra, {
    fields: [membership.palaistra_id],
    references: [palaistra.id],
  }),
}));

export const parental = pgTable(
  'parental',
  {
    student_id: varchar('student_id', { length: 12 })
      .references(() => user.id)
      .notNull(),
    parent_id: varchar('parent_id', { length: 12 })
      .references(() => user.id)
      .notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.student_id, table.parent_id] }),
  }),
);
export const parentalRelations = relations(parental, ({ one }) => ({
  student: one(user, {
    fields: [parental.student_id],
    references: [user.id],
  }),
  parent: one(palaistra, {
    fields: [parental.parent_id],
    references: [palaistra.id],
  }),
}));

export const palaistra = pgTable('palaistra', {
  id: varchar('id', { length: 12 }).primaryKey(),
  handle: varchar('handle', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  pic_url: text('pic_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const palaistraRelations = relations(palaistra, ({ many }) => ({
  memberships: many(membership),
  sports: many(sport),
  categories: many(category),
  groups: many(group),
}));

export const sport = pgTable('sport', {
  id: varchar('id', { length: 12 }).primaryKey(),

  palaistra_id: varchar('palaistra_id', { length: 12 })
    .notNull()
    .references(() => palaistra.id),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  category_count: integer('category_count').default(0).notNull(),
  group_count: integer('group_count').default(0).notNull(),
  student_count: integer('student_count').default(0).notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const sportRelations = relations(sport, ({ one, many }) => ({
  palaistra: one(palaistra, {
    fields: [sport.palaistra_id],
    references: [palaistra.id],
  }),
  groups: many(group),
  categories: many(category),
}));

export const category = pgTable('category', {
  id: varchar('id', { length: 12 }).primaryKey(),

  palaistra_id: varchar('palaistra_id', { length: 12 })
    .notNull()
    .references(() => palaistra.id),
  sport_id: varchar('sport_id', { length: 12 })
    .notNull()
    .references(() => sport.id),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  group_count: integer('group_count').default(0).notNull(),
  student_count: integer('student_count').default(0).notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const categoryRelations = relations(category, ({ one, many }) => ({
  palaistra: one(palaistra, {
    fields: [category.palaistra_id],
    references: [palaistra.id],
  }),
  sport: one(sport, {
    fields: [category.sport_id],
    references: [sport.id],
  }),
  groups: many(group),
}));

export const scheduleObject = z.object({
  days: z.enum(days).array(),
  start_time: z.string().time({ precision: 0 }), // Time in HH:mm:ss format
  end_time: z.string().time({ precision: 0 }), // Time in HH:mm:ss format
});

export const group = pgTable('group', {
  id: varchar('id', { length: 12 }).primaryKey(),

  palaistra_id: varchar('palaistra_id', { length: 12 })
    .notNull()
    .references(() => palaistra.id),
  sport_id: varchar('sport_id', { length: 12 })
    .notNull()
    .references(() => sport.id),
  category_id: varchar('category_id', { length: 12 })
    .notNull()
    .references(() => category.id),

  name: varchar('name', { length: 255 }).notNull(),
  max_students: integer('max_students'),

  schedule: jsonb('schedule')
    .notNull()
    .$type<z.infer<typeof scheduleObject>[]>(),

  student_count: integer('student_count').default(0).notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const groupRelations = relations(group, ({ one }) => ({
  palaistra: one(palaistra, {
    fields: [group.palaistra_id],
    references: [palaistra.id],
  }),
  sport: one(sport, {
    fields: [group.sport_id],
    references: [sport.id],
  }),
  category: one(category, {
    fields: [group.category_id],
    references: [category.id],
  }),
}));

export const enrollment = pgTable('enrollment', {
  id: varchar('id', { length: 12 }).primaryKey(),

  student_id: varchar('student_id', { length: 12 })
    .references(() => user.id)
    .notNull(),
  palaistra_id: varchar('palaistra_id', { length: 12 })
    .references(() => palaistra.id)
    .notNull(),
  sport_id: varchar('sport_id', { length: 12 })
    .references(() => sport.id)
    .notNull(),
  category_id: varchar('category_id', { length: 12 })
    .references(() => category.id)
    .notNull(),
  group_id: varchar('group_id', { length: 12 })
    .references(() => group.id)
    .notNull(),

  starts_at: date('starts_at', { mode: 'string' }).notNull(),
  ends_at: date('ends_at', { mode: 'string' }).notNull(),

  time_attended: time('time_attended').default('00:00:00').notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const enrollmentRelations = relations(enrollment, ({ one, many }) => ({
  student: one(user, {
    fields: [enrollment.student_id],
    references: [user.id],
  }),
  palaistra: one(palaistra, {
    fields: [enrollment.palaistra_id],
    references: [palaistra.id],
  }),
  sport: one(sport, {
    fields: [enrollment.sport_id],
    references: [sport.id],
  }),
  category: one(category, {
    fields: [enrollment.category_id],
    references: [category.id],
  }),
  group: one(group, {
    fields: [enrollment.group_id],
    references: [group.id],
  }),

  attendance: many(attendance),
}));

export const attendance = pgTable('attendance', {
  id: varchar('id', { length: 12 }).primaryKey(),

  student_id: varchar('student_id', { length: 12 })
    .references(() => user.id)
    .notNull(),
  admin_id: varchar('admin_id', { length: 12 })
    .references(() => user.id)
    .notNull(),

  palaistra_id: varchar('palaistra_id', { length: 12 })
    .references(() => palaistra.id)
    .notNull(),
  sport_id: varchar('sport_id', { length: 12 })
    .references(() => sport.id)
    .notNull(),
  category_id: varchar('category_id', { length: 12 })
    .references(() => category.id)
    .notNull(),
  group_id: varchar('group_id', { length: 12 })
    .references(() => group.id)
    .notNull(),

  enrollment_id: varchar('enrollment_id', { length: 12 })
    .references(() => enrollment.id)
    .notNull(),

  taken_at: timestamp('taken_at', { mode: 'string' }).defaultNow().notNull(),
  duration: time('duration').notNull(),

  created_at: timestamp('created_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const attendaceRelations = relations(attendance, ({ one }) => ({
  student: one(user, {
    fields: [attendance.student_id],
    references: [user.id],
  }),

  palaistra: one(palaistra, {
    fields: [attendance.palaistra_id],
    references: [palaistra.id],
  }),
  sport: one(sport, {
    fields: [attendance.sport_id],
    references: [sport.id],
  }),
  category: one(category, {
    fields: [attendance.category_id],
    references: [category.id],
  }),
  group: one(group, {
    fields: [attendance.group_id],
    references: [group.id],
  }),

  enrollment: one(enrollment, {
    fields: [attendance.enrollment_id],
    references: [enrollment.id],
  }),
}));
export const landing_page_contacts = pgTable('landing_page_contacts', {
  id: varchar('id', { length: 12 }).primaryKey(),

  name: text('name').notNull(),
  company: text('company').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  students: text('students').notNull(),
  teachers: text('teachers').notNull(),
  message: text('message'),

  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Types
export type UserSelect = typeof user.$inferSelect;
export type PalaistraSelect = typeof palaistra.$inferSelect;

export type CategoryInsert = typeof category.$inferInsert;
export type GroupInsert = typeof group.$inferInsert;
export type MembershipInsert = typeof membership.$inferInsert;
export type EnrollmentInsert = typeof enrollment.$inferInsert;

// Schemas
export const PalaistraInsertSchema = createInsertSchema(palaistra);
export const CategoryInsertSchema = createInsertSchema(category);
export const GroupInsertSchema = createInsertSchema(group);
