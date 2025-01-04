'use server';

import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { db, schema } from '@/db';
import { PalaistraInsertSchema } from '@/db/schema';

import { id } from '@/lib/nanoid';
import { NeonDbError } from '@neondatabase/serverless';

export type CreatePalaistraActionState = {
  form: {
    name?: string;
    handle?: string;
  };
} & (
  | {
      ok: true;
      data: {
        palaistra_id: string;
      };
    }
  | {
      ok: false;
      error: string;
    }
);

export const createPalaistra = async (
  prevState: null | CreatePalaistraActionState,
  formData: FormData,
): Promise<CreatePalaistraActionState> => {
  const name = formData.get('name')?.toString();
  const handle = formData.get('handle')?.toString();
  const pic_url = formData.get('pic-url')?.toString();

  try {
    const auth = await getUserAndSession();

    if (!auth?.user) redirect('/signin');

    const palaistra_id = id();
    const data = PalaistraInsertSchema.omit({ id: true }).parse({
      name,
      handle,
      pic_url,
    });

    await db.insert(schema.palaistra).values({
      ...data,
      id: palaistra_id,
    })

    await db.insert(schema.membership).values({
      palaistra_id,
      user_id: auth.user.id,
      roles: ['owner'],
    });

    return {
      ok: true,
      form: {
        name,
        handle,
      },
      data: {
        palaistra_id,
      },
    };
  } catch (error) {
    let msg = "error";
    if (error instanceof NeonDbError) {
      if (error.constraint?.includes("unique")) {
        msg = "unique_handle"
      }
    }
    console.log(error);
    return {
      ok: false,
      error: msg, 
      form: {
        name,
        handle,
      },
    };
  }
};
