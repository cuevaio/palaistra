'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox, JollyCheckboxGroup } from '@/components/ui/jolly/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Day } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { updateSchedule } from './action';

export const UpdateScheduleForm = (props: {
  days: Day[];
  hour_start: string;
  hour_end: string;
}) => {
  const params = useParams<{ user_id: string }>();

  const [state, action, isPending] = React.useActionState(updateSchedule, null);

  React.useEffect(() => {
    console.log(state);
    if (!isPending && state?.success) {
      setOpen(false);
      toast('Horario actualizado');
    }
  }, [state, isPending]);

  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }))}>
          Actualizar horario
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar horario</DialogTitle>
          </DialogHeader>
          <form action={action} className="mx-auto flex w-min flex-col gap-2">
            <input
              type="hidden"
              name="student_id"
              defaultValue={params.user_id}
            />
            <Label>Hora de entrada</Label>
            <Select
              key={JSON.stringify(state?.form?.hour_start)}
              defaultValue={state?.form?.hour_start || props.hour_start}
              required
              name="hour_start"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Hora de entrada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'13:00:00'}>13:00</SelectItem>
                <SelectItem value={'13:15:00'}>13:15</SelectItem>
                <SelectItem value={'14:00:00'}>14:00</SelectItem>
                <SelectItem value={'14:15:00'}>14:15</SelectItem>
                <SelectItem value={'15:00:00'}>15:00</SelectItem>
                <SelectItem value={'18:00:00'}>18:00</SelectItem>
                <SelectItem value={'19:00:00'}>19:00</SelectItem>
              </SelectContent>
            </Select>
            <Label>Hora de salida</Label>

            <Select
              key={JSON.stringify(state?.form?.hour_end)}
              defaultValue={state?.form?.hour_end || props.hour_end}
              required
              name="hour_end"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Hora de salida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'14:00:00'}>14:00</SelectItem>
                <SelectItem value={'15:00:00'}>15:00</SelectItem>
                <SelectItem value={'17:00:00'}>17:00</SelectItem>
                <SelectItem value={'19:00:00'}>19:00</SelectItem>
                <SelectItem value={'20:00:00'}>20:00</SelectItem>
              </SelectContent>
            </Select>

            <JollyCheckboxGroup
              key={JSON.stringify(state?.form?.days)}
              description="Selecciona los días contratados"
              label="Días"
              isRequired
              name="days"
              defaultValue={state?.form?.days || props.days}
            >
              <Checkbox value="L">Lunes</Checkbox>
              <Checkbox value="M">Martes</Checkbox>
              <Checkbox value="X">Miércoles</Checkbox>
              <Checkbox value="J">Jueves</Checkbox>
              <Checkbox value="V">Viernes</Checkbox>
              <Checkbox value="S">Sábado</Checkbox>
              <Checkbox value="D">Domingo</Checkbox>
            </JollyCheckboxGroup>
            <Button type="submit" className="w-fit" disabled={isPending}>
              {isPending && <Loader2Icon className="mr-2 animate-spin" />}
              Guardar cambios
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
