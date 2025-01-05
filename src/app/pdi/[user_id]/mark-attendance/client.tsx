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

import { days } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { markAttendance } from './action';

export const MarkAttendanceButton = ({
  last_attendance_date,
}: {
  last_attendance_date?: string;
}) => {
  const params = useParams<{ user_id: string }>();

  const [state, action, isPending] = React.useActionState(markAttendance, null);

  React.useEffect(() => {
    if (!isPending && state?.success) {
      toast('Asistencia registrada');
    }
  }, [state, isPending]);

  const day = days[new Date().getDay()];
  console.log(last_attendance_date);

  const has_passed_a_minute = React.useMemo(() => {
    let has_passed_a_minute = true;
    if (last_attendance_date) {
      const d = new Date(last_attendance_date + 'Z');
      const now = new Date();

      if (now.getTime() - d.getTime() < 1000 * 60 * 5) {
        has_passed_a_minute = false;
      }
    }
    return has_passed_a_minute;
  }, [last_attendance_date]);

  return (
    <form action={action} className="my-16 flex w-min flex-col gap-2">
      <input type="hidden" name="student_id" defaultValue={params.user_id} />
      <div className={cn({ hidden: day !== 'D' }, 'w-full')}>
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
      <Button disabled={isPending || !has_passed_a_minute}>
        Marcar asistencia
      </Button>
    </form>
  );
};
