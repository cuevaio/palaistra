'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDebounceCallback } from 'usehooks-ts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { days as DAYS } from '@/lib/constants';
import { compareDays } from '@/lib/utils';

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

  const [status, setStatus] = React.useState<string>(
    searchParams.get('status') ?? 'all',
  );
  React.useEffect(() => {
    if (status !== searchParams.get('status')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('status', status);
      router.push(`/?${newSearchParams.toString()}`);
    }
  }, [router, status, searchParams]);

  return (
    <div className="grid-cols-2 space-y-4 md:grid md:space-y-0">
      <Input
        placeholder="Buscar..."
        defaultValue={search}
        onChange={(event) => debouncedSearch(event.target.value)}
      />
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-end md:divide-x">
        <ToggleGroup
          type="multiple"
          value={days}
          onValueChange={setDays}
          variant="outline"
        >
          {DAYS.toSorted(compareDays).map((d) => (
            <ToggleGroupItem key={d} value={d}>
              {d}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <RadioGroup
          value={status}
          onValueChange={setStatus}
          className="flex items-center gap-4 pl-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="text-sm font-medium">
              Todos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="active" />
            <Label htmlFor="active" className="text-sm font-medium">
              Activos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inactive" id="inactive" />
            <Label htmlFor="inactive" className="text-sm font-medium">
              Inactivos
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
