'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { days } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { markAttendance } from './action';

export const MarkAttendanceButton = () => {
  const params = useParams<{ user_id: string }>();

  const [state, action, isPending] = React.useActionState(markAttendance, null);

  React.useEffect(() => {
    if (!isPending && state?.success) {
      alert('FINO!');
    }
  }, [state, isPending]);

  const day = days[new Date().getDay()];

  return (
    <form action={action} className="flex w-min flex-col gap-2">
      <input type="hidden" name="student_id" defaultValue={params.user_id} />
      <div>
        <Label htmlFor="hours">Horas</Label>
        <Input
          id="hours"
          name="hours"
          defaultValue="2"
          type="number"
          placeholder="Horas"
          className={cn({ hidden: day === 'D' })}
        />
      </div>
      <Button disabled={isPending}>Marcar asistencia</Button>
    </form>
  );
};
