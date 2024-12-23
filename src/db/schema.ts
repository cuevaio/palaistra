import {
  AnyPgColumn,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const palaistra = pgTable('palaistra', {
  id: varchar('id', { length: 12 }).primaryKey(),
  handle: varchar('handle', { length: 255 }),
  name: varchar('name', { length: 255 }),
});

export const category = pgTable('group', {
  id: varchar('id', { length: 12 }).primaryKey(),
  palaistra_id: varchar('palaistra_id', { length: 12 })
    .notNull()
    .references(() => palaistra.id),
  parent_category_id: varchar('parent_category_id', { length: 12 }).references(
    (): AnyPgColumn => category.id,
  ),
  name: varchar('name', { length: 255 }),
  description: text('description'),
});

export const group = pgTable('group', {
  id: varchar('id', { length: 12 }).primaryKey(),
  palaistra_id: varchar('palaistra_id', { length: 12 })
    .notNull()
    .references(() => palaistra.id),
  category_id: varchar('category_id', { length: 12 })
    .notNull()
    .references(() => category.id),
});

export const teacher = pgTable('teacher', {
  id: varchar('id', { length: 12 }),
  palaistra_id: varchar('palaistra_id', { length: 12 })
    .notNull()
    .references(() => palaistra.id),
});

export const landing_page_contacts = pgTable('landing_page_contacts', {
  id: varchar('id', { length: 12 }).primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  students: text('students').notNull(),
  teachers: text('teachers').notNull(),
  message: text('messsage'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
