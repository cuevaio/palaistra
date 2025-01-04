'use server';

import { z } from 'zod';

import { db, schema } from '@/db';
import { CategoryInsertSchema, GroupInsertSchema } from '@/db/schema';

export type RegisterActionState =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export const upsert = async (
  prevState: null | RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const data = z
      .object({
        palaistra_id: z.string().length(12),
        groups: z.array(GroupInsertSchema.omit({ palaistra_id: true })),
        categories: z.array(CategoryInsertSchema.omit({ palaistra_id: true })),
      })
      .parse(JSON.parse(formData.get('data')?.toString() || '{}'));

    await db
      .insert(schema.category)
      .values(
        data.categories.map((c) => ({ ...c, palaistra_id: data.palaistra_id })),
      );

    /*  await db
      .insert(schema.group)
      .values(
        data.groups.map((g) => ({ ...g, palaistra_id: data.palaistra_id })),
      ); */

    return {
      ok: true,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      error: 'error',
    };
  }
};
