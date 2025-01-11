'use client';

export const LocalTime = ({ time }: { time: string }) => {
  return (
    <time dateTime={time} suppressHydrationWarning>
      {new Date(time + 'Z').toLocaleString('es-PE')}
    </time>
  );
};
