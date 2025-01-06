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

import { RemoveAttendanceDialog } from './remove';

export const AttendanceTeachers = ({
  attendance,
}: {
  attendance: { id: string; date: string; time: string }[];
}) => {
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
            mode="multiple"
            selected={attendance.map((x) => new Date(x.date + 'Z'))}
          />
        </TabsContent>
        <TabsContent
          value="table"
          className="flex justify-center rounded-lg data-[state=active]:min-h-[287.19px] data-[state=active]:border"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Duración de clase</TableHead>
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
                    {new Date(d.date + 'Z').toLocaleString('es', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',

                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{d.time}</TableCell>
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
