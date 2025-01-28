'use client';

import React from 'react';

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

import { RemoveAttendanceDialog } from './remove';

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

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();

  React.useEffect(() => {
    if (selectedDate) {
      localStorage.setItem(
        'selectedDate',
        selectedDate.toISOString().split('T')[0],
      );
      window.dispatchEvent(new StorageEvent('storage'));
    }
  }, [selectedDate]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const d = localStorage.getItem('selectedDate');
      if (d) {
        setSelectedDate(new Date(d + 'T05:00:00Z'));
      }
    }
  }, []);

  const [open, setOpen] = React.useState(false);

  const [selectedAttendance, setSelectedAttendance] = React.useState<
    { id: string; date: string; time: string } | undefined
  >();

  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const button = document.querySelector('#mark-assistance');
      setIsAdmin(!!button);
    }, 5000);

    return () => {
      clearTimeout(t);
    };
  }, []);

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
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
            }}
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
                        date.getTime() >= start.getTime() &&
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
                            ) && 'bg-blue-500/60'),
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
              {attendance
                .toSorted((a, b) => {
                  const a_date = new Date(a.date + 'Z');
                  const b_date = new Date(b.date + 'Z');
                  return a_date.getTime() - b_date.getTime();
                })
                .map((d) => (
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
                            : 'bg-blue-500/60',
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
      {isAdmin && selectedAttendance && (
        <RemoveAttendanceDialog
          open={open}
          setOpen={setOpen}
          selectedAttendance={selectedAttendance}
        />
      )}
    </div>
  );
};
