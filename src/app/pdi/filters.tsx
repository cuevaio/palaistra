'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDebounceCallback } from 'usehooks-ts';

import { CategorySelect, GroupSelect } from '@/db/schema';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Filters = ({
  groups,
}: {
  groups: (GroupSelect & { category: CategorySelect })[];
}) => {
  const searchParams = useSearchParams();
  const [selectedGroup, setSelectedGroup] = React.useState(
    searchParams.get('group') || 'all',
  );
  const router = useRouter();

  React.useEffect(() => {
    if (selectedGroup && selectedGroup !== searchParams.get('group')) {
      const newSearchParams = new URLSearchParams(searchParams);

      if (selectedGroup === 'all') {
        newSearchParams.delete('group');
      } else {
        newSearchParams.set('group', selectedGroup);
      }
      router.push(`/?${newSearchParams.toString()}`);
    }
  }, [router, selectedGroup, searchParams]);

  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounceCallback(setSearch, 500);

  React.useEffect(() => {
    if (search !== searchParams.get('search')) {
      const newSearchParams = new URLSearchParams(searchParams);

      if (search === '') {
        newSearchParams.delete('search');
      } else {
        newSearchParams.set('search', search);
      }
      router.push(`/?${newSearchParams.toString()}`);
    }
  }, [search, router, searchParams]);

  return (
    <div className="grid grid-cols-2">
      <Input
        placeholder="Buscar..."
        defaultValue={search}
        onChange={(event) => debouncedSearch(event.target.value)}
      />
      <div className="flex justify-end gap-4">
        <Select onValueChange={setSelectedGroup} value={selectedGroup}>
          <SelectTrigger className="col-span-1 col-start-4 ml-auto w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Grupos</SelectLabel>
              <SelectItem value="all">Todos los grupos</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.category.name} | {group.schedule[0].days.join(', ')} |{' '}
                  {group.schedule[0].start_time} - {group.schedule[0].end_time}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
