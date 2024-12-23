import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const palaistra = pgTable('palaistra', {
  id: varchar('id', { length: 12 }),
  handle: varchar('handle', { length: 255 }),
  name: varchar('name', { length: 255 }),
});

export const group = pgTable('group', {
  id: varchar('id', { length: 12 }),
  palaistra_id: varchar('palaistra_id', { length: 12 })
    .notNull()
    .references(() => palaistra.id),
});
