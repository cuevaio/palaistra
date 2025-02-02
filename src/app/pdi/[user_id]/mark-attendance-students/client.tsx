'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { markAttendance } from './action';

export const MarkAttendanceButton = () => {
  const params = useParams<{ user_id: string }>();

  const [state, action, isPending] = React.useActionState(markAttendance, null);

  React.useEffect(() => {
    if (!isPending && state?.success) {
      toast('Asistencia registrada');
    }
  }, [state, isPending]);

  const [date, setDate] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    // Initial value
    if (typeof window !== 'undefined') {
      const d = localStorage.getItem('selectedDate');
      if (d) {
        setDate(d);
      }
    }

    // Listen for changes
    const handleStorageChange = () => {
      const d = localStorage.getItem('selectedDate');
      if (d) {
        setDate(d);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <form action={action} className="mx-auto my-16 flex w-min flex-col gap-2">
      <input type="hidden" name="student_id" defaultValue={params.user_id} />
      <input type="hidden" name="date" defaultValue={date} />
      <div className="w-full">
        <Label htmlFor="hours">Duración</Label>
        <Select name="hours" defaultValue="1">
          <SelectTrigger id="hours" className="w-[200px]">
            <SelectValue placeholder="Selecciona la duración" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Duración</SelectLabel>
              <SelectItem value="1">1h</SelectItem>
              <SelectItem value="2">2h</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button id="mark-assistance" disabled={isPending}>
        Marcar asistencia (
        {new Date(
          date ? date + 'T05:00:00Z' : new Date().toISOString(),
        ).toLocaleDateString()}
        )
      </Button>
    </form>
  );
};
