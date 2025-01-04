'use server';

import { deleteSessionTokenCookie } from '@/auth';

export async function logout(): Promise<
  | {
      success: true;
    }
  | { success: false; error: string }
> {
  try {
    await deleteSessionTokenCookie();
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: 'Something went wrong' };
  }
}
