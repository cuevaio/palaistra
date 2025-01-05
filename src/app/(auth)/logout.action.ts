'use server';

import { deleteSessionTokenCookie } from '@/auth';
import { redirect } from 'next/navigation';

export async function logout() {
  try {
    await deleteSessionTokenCookie();
    redirect("/login")
  } catch (error) {
  
    console.error(error);
  }
}
