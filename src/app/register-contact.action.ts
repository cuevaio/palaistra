'use server';

import { nanoid } from 'nanoid';
import { z } from 'zod';

import { db, schema } from '@/db';

export type RegisterActionState = {
  form: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    students?: string;
    teachers?: string;
    message?: string;
  };
} & (
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    }
);

export const register = async (
  prevState: null | RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  const name = formData.get('name')?.toString();
  const company = formData.get('company')?.toString();
  const email = formData.get('email')?.toString();
  const phone = formData.get('phone')?.toString();
  const students = formData.get('students')?.toString();
  const teachers = formData.get('teachers')?.toString();
  const message = formData.get('message')?.toString();
  try {
    const data = z
      .object({
        name: z.string(),
        company: z.string(),
        email: z.string(),
        phone: z.string().nullish(),
        students: z.string(),
        teachers: z.string(),
        message: z.string().nullish(),
      })
      .parse({
        name,
        company,
        email,
        phone,
        students,
        teachers,
        message,
      });

    await db
      .insert(schema.landing_page_contacts)
      .values({ ...data, id: nanoid(12) });

    return {
      ok: true,
      form: {
        name,
        company,
        email,
        phone,
        students,
        teachers,
        message,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      error: 'error',
      form: {
        name,
        company,
        email,
        phone,
        students,
        teachers,
        message,
      },
    };
  }
};
