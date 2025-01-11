'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';
import { NeonDbError } from '@neondatabase/serverless';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { ActionState } from '@/lib/action-state-generic-type';
import { id } from '@/lib/nanoid';

// Using your original types:
type CreateLinkState = ActionState<
  {
    name?: string;
  },
  {
    id: string;
  }
>;

export const createLink = async (
  prevState: null | CreateLinkState,
  formData: FormData,
): Promise<CreateLinkState> => {
  const name = formData.get('name')?.toString();

  const form = { name };

  try {
    const auth = await getUserAndSession();

    if (!auth) redirect('/signin');
    const isAdmin = await redis.sismember(
      `membership|${auth.user.id}|${pdi_id}`,
      'admin',
    );

    if (!isAdmin) redirect('/');

    if (!form.name) throw new Error('name missing');

    const invite_id = id();
    await db.insert(schema.student_invite).values({
      id: invite_id,
      admin_id: auth.user.id,
      recipient_name: form.name,
      palaistra_id: pdi_id,
    });

    revalidatePath('/students');

    return {
      success: true,
      data: {
        id: invite_id,
      },
      form,
    };
  } catch (error) {
    let msg = 'error';
    if (error instanceof NeonDbError) {
      if (error.constraint?.includes('unique')) {
        msg = 'unique_handle';
      }
    }
    console.log(error);
    return {
      success: false,
      error: msg,
      form,
    };
  }
};
