'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { OmegaIcon } from 'lucide-react';
import { useDebounceCallback } from 'usehooks-ts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { days as DAYS } from '@/lib/constants';

export const Filters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [days, setDays] = React.useState<string[]>(
    searchParams.get('days')?.split('') ?? [],
  );
  React.useEffect(() => {
    if (days?.join('') !== searchParams.get('days')) {
      const newSearchParams = new URLSearchParams(searchParams);

      if (!days?.length) {
        newSearchParams.delete('days');
      } else {
        newSearchParams.set('days', days.join(''));
      }
      router.push(`/?${newSearchParams.toString()}`);
    }
  }, [router, days, searchParams]);

  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounceCallback(setSearch, 500);
  React.useEffect(() => {
    if (search !== searchParams.get('search')) {
      const newSearchParams = new URLSearchParams(searchParams);

      if (search === '') {
        newSearchParams.delete('search');
      } else {
        newSearchParams.set('search', search);
        newSearchParams.set('days', ['L', 'M', 'X'].join(''));
      }
      router.push(`/?${newSearchParams.toString()}`);
    }
  }, [search, router, searchParams]);

  const [op, setOp] = React.useState<string>(searchParams.get('op') ?? 'OR');
  React.useEffect(() => {
    if (op && op !== searchParams.get('op')) {
      const newSearchParams = new URLSearchParams(searchParams);

      if (!op) {
        newSearchParams.delete('op');
      } else {
        newSearchParams.set('op', op);
      }
      router.push(`/?${newSearchParams.toString()}`);
    }
  }, [router, op, searchParams]);

  return (
    <div className="grid-cols-2 md:grid space-y-4 md:space-y-0">
      <Input
        placeholder="Buscar..."
        defaultValue={search}
        onChange={(event) => debouncedSearch(event.target.value)}
      />
      <div className="flex flex-col md:justify-end justify-center items-center gap-4 md:flex-row md:divide-x">
        <ToggleGroup
          type="multiple"
          value={days}
          onValueChange={setDays}
          variant="outline"
        >
          {DAYS.toSorted((a, b) => {
            const dayOrder = {
              L: 0, // Lunes
              M: 1, // Martes
              X: 2, // Miércoles
              J: 3, // Jueves
              V: 4, // Viernes
              S: 5, // Sábado
              D: 6, // Domingo
            };
            return dayOrder[a] - dayOrder[b];
          }).map((d) => (
            <ToggleGroupItem key={d} value={d}>
              {d}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <RadioGroup
          key={op}
          orientation="horizontal"
          className="flex pl-4"
          value={op}
          onValueChange={setOp}
          unselectable="on"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="OR" id="OR" unselectable="on" />
            <Label htmlFor="OR">
              <OmegaIcon className="rotate-180" />
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="AND" id="AND" unselectable="on" />
            <Label htmlFor="AND">
              <OmegaIcon />
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
