'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { signup } from './signup.action';

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, action, isPending] = React.useActionState(signup, null);

  React.useEffect(() => {
    if (state?.ok) {
      toast.success(`Te enviamos un correo con el código de verificación`);

      const after = searchParams.get('after');

      const search = new URLSearchParams();
      search.set('email', state.form.email);
      if (after) {
        search.set('after', after);
      }

      router.push(`/validate?${search.toString()}`);
    } else {
      console.log(state?.error);
    }
  }, [state, router, searchParams]);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <Input
        id="name"
        name="name"
        placeholder="Ingrese su nombre"
        required
        disabled={isPending}
        defaultValue={state?.form.name}
      />

      <Input
        type="email"
        name="email"
        placeholder="Email"
        disabled={isPending}
      />
      <Button className="w-full" disabled={isPending}>
        Continue
      </Button>
    </form>
  );
}
