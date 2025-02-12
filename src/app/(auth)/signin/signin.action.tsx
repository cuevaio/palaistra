'use server';

import { OTP_EXPIRES_IN_S } from '@/auth/constants';
import { z } from 'zod';

import { redis } from '@/db/redis';

import { otp } from '@/lib/nanoid';
import { resend } from '@/lib/resend';

import { SigninCodeEmail } from './email';

export type SigninActionState =
  | {
      ok: true;
      form: {
        email: string;
      };
    }
  | {
      ok: false;
      error: string;
      form: {
        email?: string;
      };
    };

export const signin = async (
  prevState: null | SigninActionState,
  formData: FormData,
): Promise<SigninActionState> => {
  const rawEmail = formData.get('email')?.toString();

  try {
    const parsedEmail = z.string().email().safeParse(rawEmail);

    if (!parsedEmail.success) {
      throw new Error('Invalid email');
    }
    const email = parsedEmail.data.toLowerCase();

    const existingUserId = await redis.get<string>(`email:${email}:user:id`);

    if (!existingUserId) {
      return { ok: true, form: { email } };
    }

    const oneTimePassword = otp();

    await resend.emails.send({
      from: 'PDI x Palaistra <pdi@auth.palaistra.com.pe>',
      to: parsedEmail.data,
      subject: 'Tu código de Palaistra x PDI',
      react: <SigninCodeEmail validationCode={oneTimePassword} />,
    });

    await redis.set(`user:${existingUserId}:otp`, oneTimePassword, {
      ex: OTP_EXPIRES_IN_S,
    });

    return { ok: true, form: { email } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        ok: false,
        error: error.message,
        form: { email: rawEmail },
      };
    }
    console.error(error);
    return {
      ok: false,
      error: 'Something went wrong',
      form: { email: rawEmail },
    };
  }
};
