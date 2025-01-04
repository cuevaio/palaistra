'use server';

import { OTP_EXPIRES_IN_S } from '@/auth/constants';
import { User } from '@/auth/types';
import { z } from 'zod';

import { redis } from '@/db/redis';

import { id, otp } from '@/lib/nanoid';
import { resend } from '@/lib/resend';

export type SignupActionState =
  | {
      ok: true;
      form: {
        name: string;
        email: string;
      };
    }
  | {
      ok: false;
      error: string;
      form: {
        name?: string;
        email?: string;
      };
    };

export const signup = async (
  prevState: null | SignupActionState,
  formData: FormData,
): Promise<SignupActionState> => {
  const rawEmail = formData.get('email')?.toString().trim().toLowerCase();
  const rawName = formData.get('name')?.toString().trim();

  try {
    const parsedEmail = z.string().email().safeParse(rawEmail);

    if (!parsedEmail.success) {
      throw new Error('Invalid email');
    }
    const email = parsedEmail.data;

    const parsedName = z.string().min(1).max(255).safeParse(rawName);

    if (!parsedName.success) {
      throw new Error('Invalid name');
    }
    const name = parsedName.data;

    let userId = await redis.get<string>(`email:${email}:user:id`);

    if (userId) {
      return {
        ok: true,
        form: {
          name,
          email,
        },
      };
    } else {
      userId = id();

      const user: User = {
        id: userId,
        name,
        email,
      };

      await redis.set(`email:${email}:user:id`, userId, {
        ex: OTP_EXPIRES_IN_S,
      });
      await redis.hset(`user:${userId}`, user);
      await redis.expire(`user:${userId}`, OTP_EXPIRES_IN_S);
    }

    const oneTimePassword = otp();

    await resend.emails.send({
      from: 'palaistra@updates.cueva.io',
      to: parsedEmail.data,
      subject: 'Your one-time password for Palaistra',
      text: `Your one-time password for Palaistra is ${oneTimePassword} and will be available for the next 15 min.`,
    });

    await redis.set(`user:${userId}:otp`, oneTimePassword, {
      ex: OTP_EXPIRES_IN_S,
    });

    return {
      ok: true,
      form: {
        name,
        email,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        ok: false,
        error: error.message,
        form: {
          name: rawName,
          email: rawEmail,
        },
      };
    }
    console.error(error);
    return {
      ok: false,
      error: 'internal',
      form: {
        name: rawName,
        email: rawEmail,
      },
    };
  }
};
