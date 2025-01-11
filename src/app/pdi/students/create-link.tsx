'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { createLink } from './create-link.action';

export const CreateLinkForm = () => {
  const [state, action, isPending] = React.useActionState(createLink, null);

  return (
    <form className="flex gap-4" action={action}>
      <Input
        placeholder="Nombre"
        name="name"
        disabled={isPending}
        defaultValue={state?.form?.name}
      />
      <Button type="submit" disabled={isPending}>
        Crear link
      </Button>
    </form>
  );
};
