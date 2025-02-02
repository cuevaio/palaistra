'use client';

import React from 'react';

import { parseDate } from '@internationalized/date';
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
import { JollyDateField } from '@/components/ui/jolly/datefield';
import { Label } from '@/components/ui/label';

import { cn } from '@/lib/utils';

import { renewSchedule } from './action';

export const RenewMembershipForm = ({
  student_id,
  student_name,
}: {
  student_id: string;
  student_name: string;
}) => {
  const [state, action, isPending] = React.useActionState(renewSchedule, null);

  React.useEffect(() => {
    console.log(state);
    if (!isPending && state?.success) {
      setOpen(false);
      toast('Membresía renovada');
    }
  }, [state, isPending]);

  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        Renovar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renovar membresía</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{student_name}</p>
        <form action={action} className="mx-auto flex w-min flex-col gap-2">
          <input type="hidden" name="student_id" defaultValue={student_id} />
          <Label>Fecha de inicio</Label>

          <JollyDateField
            name="valid_from"
            defaultValue={
              state?.form?.valid_from
                ? parseDate(state.form.valid_from)
                : parseDate(
                    new Date()
                      .toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })
                      .split('/')
                      .toReversed()
                      .join('-'),
                  )
            }
            isRequired
          />

          <Label>Fecha de fin</Label>

          <JollyDateField
            name="valid_to"
            defaultValue={
              state?.form?.valid_to
                ? parseDate(state.form.valid_to)
                : parseDate(
                    new Date(new Date().setMonth(new Date().getMonth() + 1))
                      .toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })
                      .split('/')
                      .toReversed()
                      .join('-'),
                  )
            }
            isRequired
          />

          <Button type="submit" className="w-fit" disabled={isPending}>
            {isPending && <Loader2Icon className="mr-2 animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
