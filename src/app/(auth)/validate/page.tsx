'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { otpAlphabetRegex } from '@/lib/nanoid';

import { validate } from './validate.action';

export default function Validate() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, action, isPending] = React.useActionState(validate, null);

  React.useEffect(() => {
    if (state?.ok) {
      const after = searchParams.get('after');

      if (after) {
        // TODO: Validate that after is a valid pathname
        router.push(after);
      } else {
        router.push('/');
      }
    }
  }, [state, router, searchParams]);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <Input
        type="email"
        name="email"
        placeholder="Email"
        disabled={isPending}
        defaultValue={state?.form.email || (searchParams.get('email') ?? '')}
      />

      <InputOTP
        maxLength={6}
        name="otp"
        pattern={otpAlphabetRegex}
        defaultValue={state?.form.otp}
        inputMode='text'
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <Button className="w-full" disabled={isPending}>
        Continuar
      </Button>
    </form>
  );
}
