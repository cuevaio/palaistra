'use server';

import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/auth';
import { User } from '@/auth/types';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '@/db';
import { redis } from '@/db/redis';

export type ValidateActionState =
  | {
      ok: true;
      data: {
        newUser: boolean;
      };
      form: {
        otp: string;
        email: string;
      };
    }
  | {
      ok: false;
      error: string;
      form: {
        otp?: string;
        email?: string;
      };
    };

export const validate = async (
  prevState: null | ValidateActionState,
  formData: FormData,
): Promise<ValidateActionState> => {
  const rawEmail = formData.get('email')?.toString();
  const rawOTP = formData.get('otp')?.toString();

  try {
    const parsedEmail = z.string().email().safeParse(rawEmail);
    const parsedOTP = z.string().min(6).safeParse(rawOTP);

    if (!parsedEmail.success) {
      throw new Error('Invalid email');
    }

    if (!parsedOTP.success) {
      throw new Error('Invalid OTP');
    }

    const otp = parsedOTP.data;
    const email = parsedEmail.data;

    const dontMatch = 'OTP and email do not match';

    const existingUserId = await redis.get<string>(`email:${email}:user:id`);

    if (!existingUserId) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      throw new Error(dontMatch);
    }

    const storedOtp = await redis.get<string>(`user:${existingUserId}:otp`);

    if (storedOtp !== otp) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      throw new Error(dontMatch);
    }

    const user = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, existingUserId))
      .limit(1);

    if (!user.length) {
      await redis.persist(`email:${email}:user:id`);
      const userRedis = await redis.hgetall<User>(`user:${existingUserId}`);

      if (!userRedis) {
        throw new Error('internal error :(');
      }
      await redis.persist(`user:${existingUserId}`);

      await db.insert(schema.user).values(userRedis);
    }

    const sessionToken = generateSessionToken();
    await createSession(sessionToken, existingUserId);

    await setSessionTokenCookie(sessionToken);

    return {
      ok: true,
      data: { newUser: !user.length },
      form: {
        email,
        otp,
      },
    };
  } catch (error) {
    console.log(error)
    if (error instanceof Error) {
      return {
        ok: false,
        error: error.message,
        form: { email: rawEmail, otp: rawOTP },
      };
    }
    console.error(error);
    return {
      ok: false,
      error: 'Something went wrong',
      form: { email: rawEmail, otp: rawOTP },
    };
  }
};
