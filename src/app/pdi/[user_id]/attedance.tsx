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
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Day, days } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { removeAttendance } from './remove-attendance.action';

export const Attendance = ({
  start_date,
  active_days,
  attendance,
}: {
  start_date: string;
  active_days: Day[];
  attendance: { id: string; date: string; time: string }[];
}) => {
  const [y, m, d] = start_date.split('-');
  const start = new Date(Number(y), Number(m) - 1, Number(d));
  const today = new Date();

  const [open, setOpen] = React.useState(false);

  const [selectedAttendance, setSelectedAttendance] = React.useState<
    { id: string; date: string; time: string } | undefined
  >();

  const [state, action, isPending] = React.useActionState(
    removeAttendance,
    null,
  );

  React.useEffect(()=>{
    if (!isPending && state?.success) {
      setOpen(false)
    }
  }, [state,isPending])

  return (
    <div className="mt-12">
      <h2 className="mb-2 text-lg font-semibold">Asistencia</h2>
      <Tabs defaultValue="calendar" className="w-[300px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="table">Tabla</TabsTrigger>
        </TabsList>
        <TabsContent
          value="calendar"
          className="flex items-start justify-center rounded-lg data-[state=active]:border"
        >
          <Calendar
            mode="multiple"
            components={{
              DayContent: (props) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { date, activeModifiers, displayMonth, ...tdProps } =
                  props;
                return (
                  <span
                    {...tdProps}
                    className={cn(
                      'flex h-full w-full items-center justify-center',
                      displayMonth.getMonth() === today.getMonth() &&
                        date.getDate() <= today.getDate() &&
                        date.getTime() > start.getTime() &&
                        (active_days.includes(days[date.getDay()])
                          ? attendance.some(
                              (d) =>
                                new Date(d.date + 'Z').getDate() ===
                                date.getDate(),
                            )
                            ? 'bg-green-500/60'
                            : 'bg-red-500/60'
                          : attendance.some(
                              (d) =>
                                new Date(d.date + 'Z').getDate() ===
                                date.getDate(),
                            ) && 'bg-orange-500/60'),
                    )}
                  >
                    {date.getDate()}
                  </span>
                );
              },
            }}
          />
        </TabsContent>
        <TabsContent
          value="table"
          className="flex justify-center rounded-lg data-[state=active]:min-h-[287.19px] data-[state=active]:border"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Día</TableHead>
                <TableHead>Duración de clase</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((d) => (
                <TableRow
                  key={d.date}
                  onClick={() => {
                    setSelectedAttendance(d);
                    setOpen(true);
                  }}
                >
                  <TableCell>
                    {new Date(d.date + 'Z').toLocaleDateString('es', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{d.time}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        active_days.includes(
                          days[new Date(d.date + 'Z').getDay()],
                        )
                          ? 'bg-green-500/60'
                          : 'bg-orange-500/60',
                        'rounded-lg px-1 py-1',
                      )}
                    >
                      {active_days.includes(
                        days[new Date(d.date + 'Z').getDay()],
                      )
                        ? 'Clase'
                        : 'Recuperación'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      {selectedAttendance && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Deseas eliminar esta asistencia?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Al hacer click en eliminar se eliminará el registro de
                asistencia del día{' '}
                {new Date(selectedAttendance.date + 'Z').toLocaleDateString(
                  'es',
                  {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  },
                )}
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
      )}
    </div>
  );
};
