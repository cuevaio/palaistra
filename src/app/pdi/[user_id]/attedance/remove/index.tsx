'use client';

import React from 'react';

import { Loader2Icon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { removeAttendance } from './action';

export const RemoveAttendanceDialog = ({
  selectedAttendance,
  open,
  setOpen,
}: {
  selectedAttendance: { date: string; id: string };
  open: boolean;
  setOpen: (x: boolean) => void;
}) => {
  const [state, action, isPending] = React.useActionState(
    removeAttendance,
    null,
  );

  React.useEffect(() => {
    if (!isPending && state?.success) {
      setOpen(false);
    }
  }, [state, isPending, setOpen]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Deseas eliminar esta asistencia?</AlertDialogTitle>
          <AlertDialogDescription>
            Al hacer click en eliminar se eliminará el registro de asistencia
            del día{' '}
            {new Date(selectedAttendance.date + 'Z').toLocaleDateString('es', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={action}>
            <input
              type="hidden"
              name="attendance_id"
              defaultValue={selectedAttendance.id}
            />
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              Eliminar
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
