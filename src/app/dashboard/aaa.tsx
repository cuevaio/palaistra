/*
'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClockIcon,
  Trash2Icon,
} from 'lucide-react';

import { CategoryInsert, GroupInsert } from '@/db/schema';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { Day, days } from '@/lib/constants';
import { id } from '@/lib/nanoid';
import { cn } from '@/lib/utils';

type Category = CategoryInsert;

type Group = GroupInsert;

export default function Page() {
  const params = useParams<{ palaistra_id: string }>();
  const { palaistra_id } = params;

  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>();
  const [selectedClassId, setSelectedClassId] = React.useState<string>();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [showCalendar, setShowCalendar] = React.useState(true);

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);

  React.useEffect(() => {
    const category_id = id();
    setCategories([
      {
        id: category_id,
        name: 'Intermedio',
        description: 'Hi!',
        palaistra_id,
      },
    ]);

    const randHour1 = Math.round(Math.random() * 13 + 6);
    const randHour2 = Math.round(Math.random() * 13 + 6);

    setGroups(() => [
      {
        id: id(),
        name: 'Intermedio Interdiario Mañana',
        palaistra_id,
        category_id: category_id,
        days: ['L', 'X', 'V'],
        start_time: randHour1.toString().padStart(2, '0') + ':00',
        end_time: (randHour1 + 2).toString().padStart(2, '0') + ':00',
        max_students: 20,
      },

      {
        id: id(),
        name: 'Intermedio Interdiario Tarde',
        palaistra_id,
        category_id: category_id,
        days: ['M', 'J', 'S'],
        start_time: randHour2.toString().padStart(2, '0') + ':00',
        end_time: (randHour2 + 1).toString().padStart(2, '0') + ':00',
        max_students: 20,
      },
    ]);
  }, [palaistra_id]);

  const getNB = React.useCallback(
    (group: Group, day: Day) =>
      groups
        .filter((c) => c.days.includes(day))
        .filter((x) => x.id !== group.id)
        .filter(
          (p) =>
             (group.start_time < p.start_time &&
              group.end_time > p.start_time) ||
            (group.start_time < p.end_time && group.end_time > p.end_time) ||
            (group.start_time >= p.start_time && group.end_time <= p.end_time),
        ),
    [groups],
  );

  const getCols = React.useCallback(
    (group: Group, day: Day) => {
      const nb = getNB(group, day);
      if (nb.length === 0) return 6;
      if (nb.length === 1) return 3;
      if (nb.length >= 2 && nb.some((x) => getNB(x, day).length >= 2)) return 2;
      return 3;
    },
    [getNB],
  );

  const selectedCategory = React.useMemo(
    () => categories.find((x) => x.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  React.useEffect(() => {
    if (selectedCategoryId) {
      const nameInput = document.querySelector(
        `#category-${selectedCategoryId}-name`,
      );
      if (nameInput) {
        (nameInput as HTMLInputElement).focus();
      }
    }
  }, [selectedCategoryId]);

  React.useEffect(() => {
    (
      document.querySelector(
        `#class-${selectedClassId}-name`,
      ) as HTMLInputElement | null
    )?.focus();
  }, [selectedClassId]);

  return (
    <>
      <div className="inv absolute bottom-16 right-1/2 flex translate-x-1/2 justify-between rounded-lg bg-foreground/80 px-16 py-2">
        <Button variant="outline" onClick={() => setShowCalendar((cv) => !cv)}>
          {showCalendar ? (
            <>
              Ocultar calendario <ChevronRightIcon />
            </>
          ) : (
            <>
              Mostrar calendario <ChevronLeftIcon />
            </>
          )}
        </Button>
      </div>

      <div
        className={cn(
          showCalendar && 'w-screen md:grid md:grid-cols-3 md:gap-4',
        )}
      >
        <div
          className={cn(
            'h-screen overflow-x-hidden overflow-y-scroll p-4',
            !showCalendar && 'mx-auto max-w-xl',
            showCalendar && 'hidden md:flex',
          )}
        >
          <div>
            <div className="mb-4 flex items-start justify-between">
              <h2 className="font-bold">PDI Perú</h2>
              <Button
                variant="outline"
                onClick={() => {
                  const categoryId = id();
                  setCategories((currentCategories) => [
                    { id: categoryId, name: '', palaistra_id },
                    ...currentCategories,
                  ]);
                  setSelectedCategoryId(categoryId);
                }}
                disabled={categories.some((g) => !g.name)}
              >
                Agregar categoría
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-10">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    selectedCategoryId === category.id &&
                      '-m-2 rounded-lg border p-2',
                  )}
                >
                  <div className="flex justify-between gap-2">
                    {selectedCategoryId !== category.id ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start px-3 py-1 text-xs font-bold sm:text-base"
                        type="button"
                        onClick={() =>
                          setSelectedCategoryId((currentValue) =>
                            currentValue === category.id
                              ? undefined
                              : category.id,
                          )
                        }
                      >
                        {category.name}
                      </Button>
                    ) : (
                      <Input
                        id={`category-${category.id}-name`}
                        className="text-xs font-bold sm:text-base"
                        value={category.name}
                        onChange={(event) =>
                          setCategories((currentCategories) =>
                            [...currentCategories].map((x) =>
                              x.id !== category.id
                                ? x
                                : { ...x, name: event.target.value },
                            ),
                          )
                        }
                      />
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSelectedCategoryId((currentValue) =>
                          currentValue === category.id
                            ? undefined
                            : category.id,
                        )
                      }
                    >
                      {selectedCategoryId === category.id ? (
                        <ChevronUpIcon />
                      ) : (
                        <ChevronDownIcon />
                      )}
                    </Button>
                  </div>
                  {selectedCategoryId === category.id && (
                    <div>
                      <Textarea
                        className="mt-2"
                        value={category.description || undefined}
                        onChange={(event) =>
                          setCategories((currentCategories) =>
                            [...currentCategories].map((x) =>
                              x.id !== category.id
                                ? x
                                : { ...x, description: event.target.value },
                            ),
                          )
                        }
                      />
                      <div className="mt-2 flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const classId = id();
                            const randHour = Math.round(Math.random() * 13 + 6);

                            setGroups((currentGroups) => [
                              {
                                id: classId,
                                days: [days[Math.round(Math.random() * 7)]],
                                palaistra_id,
                                start_time:
                                  randHour.toString().padStart(2, '0') + ':00',
                                end_time:
                                  (randHour + 2).toString().padStart(2, '0') +
                                  ':00',
                                category_id: category.id,
                                max_students: 10,
                                name: '',
                              },
                              ...currentGroups,
                            ]);
                            setSelectedClassId(classId);
                          }}
                          disabled={groups
                            .filter((c) => c.category_id === category.id)
                            .some((x) => !x.name)}
                        >
                          <ClockIcon className="mr-2" /> Agregar grupo
                        </Button>
                      </div>
                      <div className="mt-4 grid gap-6 md:grid-cols-2">
                        {groups
                          .filter((c) => c.category_id === category.id)
                          .map((group) => (
                            <div
                              key={group.id}
                              className="grid grid-cols-1 gap-2"
                            >
                              <div className="flex justify-between gap-2">
                                <Input
                                  id={`class-${group.id}-name`}
                                  value={group.name}
                                  placeholder="Nombre"
                                  className="text-xs sm:text-base"
                                  onChange={(event) =>
                                    setGroups((currentGroups) =>
                                      [...currentGroups].map((c) =>
                                        c.id !== group.id
                                          ? c
                                          : { ...c, name: event.target.value },
                                      ),
                                    )
                                  }
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="aspect-square"
                                  onClick={() => {
                                    setGroups((currentGroups) =>
                                      currentGroups.filter(
                                        (c) => c.id !== group.id,
                                      ),
                                    );
                                  }}
                                >
                                  <Trash2Icon />
                                </Button>
                              </div>
                              <div className="grid grid-cols-7 gap-2">
                                {days.map((day) => (
                                  <Button
                                    key={day}
                                    type="button"
                                    size="icon"
                                    className="aspect-square h-auto w-full p-0 text-xs"
                                    variant={
                                      group.days.includes(day)
                                        ? 'default'
                                        : 'outline'
                                    }
                                    onClick={() =>
                                      setGroups((currentGroups) =>
                                        [...currentGroups].map((c) =>
                                          c.id !== group.id
                                            ? c
                                            : {
                                                ...c,
                                                days: c.days.includes(day)
                                                  ? c.days.filter(
                                                      (x) => x !== day,
                                                    )
                                                  : [...c.days, day],
                                              },
                                        ),
                                      )
                                    }
                                  >
                                    {day}
                                  </Button>
                                ))}
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <div>
                                  <Select
                                    value={group.start_time}
                                    onValueChange={(value) =>
                                      setGroups((currentGroups) =>
                                        [...currentGroups].map((c) =>
                                          c.id !== group.id
                                            ? c
                                            : {
                                                ...c,
                                                start_time: value,
                                              },
                                        ),
                                      )
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Inicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {new Array(17).fill(0).map((_, index) => (
                                        <React.Fragment key={index}>
                                          {['00', '15', '30', '45'].map((m) => (
                                            <SelectItem
                                              key={m}
                                              value={
                                                (index + 6)
                                                  .toString()
                                                  .padStart(2, '0') +
                                                ':' +
                                                m
                                              }
                                            >
                                              {(index + 6)
                                                .toString()
                                                .padStart(2, '0') +
                                                ':' +
                                                m}
                                            </SelectItem>
                                          ))}
                                        </React.Fragment>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Select
                                    value={group.end_time}
                                    onValueChange={(value) =>
                                      setGroups((currentGroups) =>
                                        [...currentGroups].map((c) =>
                                          c.id !== group.id
                                            ? c
                                            : { ...c, end_time: value },
                                        ),
                                      )
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Fin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="06:15">
                                        06:15
                                      </SelectItem>
                                      <SelectItem value="06:30">
                                        06:30
                                      </SelectItem>
                                      <SelectItem value="06:45">
                                        06:45
                                      </SelectItem>
                                      {new Array(16).fill(0).map((_, index) => (
                                        <React.Fragment key={index}>
                                          {['00', '15', '30', '45'].map((m) => (
                                            <SelectItem
                                              key={m}
                                              value={
                                                (index + 7)
                                                  .toString()
                                                  .padStart(2, '0') +
                                                ':' +
                                                m
                                              }
                                            >
                                              {(index + 7)
                                                .toString()
                                                .padStart(2, '0') +
                                                ':' +
                                                m}
                                            </SelectItem>
                                          ))}
                                        </React.Fragment>
                                      ))}
                                      <SelectItem value="23:00">
                                        23:00
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Input
                                type="number"
                                placeholder="Max. Alumnos"
                                className="text-xs sm:text-base"
                                value={
                                  group.max_students
                                    ? group.max_students.toString()
                                    : ''
                                }
                                min={1}
                                onChange={(event) =>
                                  setGroups((currentGroups) =>
                                    [...currentGroups].map((c) =>
                                      c.id !== group.id
                                        ? c
                                        : {
                                            ...c,
                                            max_students:
                                              Number(event.target.value) ||
                                              null,
                                          },
                                    ),
                                  )
                                }
                              />
                            </div>
                          ))}
                      </div>
                      <Button
                        variant="link"
                        className="mt-2 flex w-full justify-center text-muted-foreground"
                        onClick={() => {
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2Icon className="mr-2" /> Eliminar categoría
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {showCalendar && (
          <div className="col-span-2 flex h-screen flex-col">
            <div className="sticky top-0 flex h-12 flex-none bg-muted">
              <div className="h-full w-8 flex-none border-x md:w-16"></div>
              <div className="grid h-full grow grid-cols-7 divide-x">
                {days.map((d) => (
                  <div
                    className="flex items-center justify-center text-sm md:text-lg"
                    key={d}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex w-full grow overflow-auto">
              <div className="w-8 flex-none text-[0.5rem] leading-3 md:w-16 md:text-base">
                {new Array(17).fill(0).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex h-16 justify-center border-x bg-muted tabular-nums',
                      {},
                    )}
                  >
                    {(idx + 6).toString().padStart(2, '0') + ':00'}
                  </div>
                ))}
              </div>
              <div className="grid grow grid-cols-7 divide-x">
                {days.map((d) => (
                  <div
                    className="grid h-[68rem] grid-cols-6 grid-rows-[repeat(68,minmax(0,1fr))]"
                    key={d}
                  >
                    {groups
                      .filter((c) => c.days.includes(d))
                      .map((c) => {
                        const [hours_start_str, minutes_start_str] =
                          c.start_time.split(':');

                        const [hours_end_str, minutes_end_str] =
                          c.end_time.split(':');

                        const hours_start = Number(hours_start_str);
                        const hours_end = Number(hours_end_str);
                        const minutes_start = Number(minutes_start_str);
                        const minutes_end = Number(minutes_end_str);

                        const start =
                          (hours_start - 6) * 4 + 1 + minutes_start / 15;

                        const end = (hours_end - 6) * 4 + 1 + minutes_end / 15;

                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedCategoryId(c.category_id);
                              setSelectedClassId(c.id);
                            }}
                            style={{
                              gridRowStart: start.toString(),
                              gridRowEnd: end.toString(),
                            }}
                            className={cn(
                              'cursor-help p-1 text-[0.6rem] leading-3 sm:text-xs',
                              {
                                '-1': 'bg-blue-400',
                                '1': 'bg-red-100',
                                '2': 'bg-green-100',
                                '3': 'bg-blue-100',
                                '4': 'bg-slate-200',
                                '5': 'bg-purple-300',
                                '6': 'bg-yellow-100',
                                '7': 'bg-gray-400',
                                '8': 'bg-orange-200',
                                '9': 'bg-sky-300',
                                '0': 'bg-red-200',
                              }[
                                c.id.split('').find((x) => !isNaN(Number(x))) ||
                                  '-1'
                              ],

                              {
                                6: 'col-span-6',
                                3: 'col-span-3',
                                2: 'col-span-2',
                              }[getCols(c, d)],
                            )}
                          >
                            <p className="text-pretty break-words font-semibold md:font-bold">
                              {c.name}
                            </p>
                            <p>{c.max_students} almn.</p>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-400">
                Eliminar categoría
              </DialogTitle>
            </DialogHeader>
            <div>
              <p className="text-balance">
                Esta acción es irreversible. ¿Estás seguro de que deseas
                eliminar el categoría <strong>{selectedCategory?.name}</strong>{' '}
                y todos sus grupos (
                {
                  groups.filter((x) => x.category_id === selectedCategoryId)
                    .length
                }
                )?
              </p>
            </div>
            <DialogFooter>
              <Button
                className=""
                variant="destructive"
                onClick={() => {
                  setGroups((currentGroups) =>
                    currentGroups.filter(
                      (c) => c.category_id !== selectedCategoryId,
                    ),
                  );
                  setCategories((currentCategories) =>
                    currentCategories.filter(
                      (g) => g.id !== selectedCategoryId,
                    ),
                  );
                  setDeleteDialogOpen(false);
                }}
              >
                Eliminar categoría
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
 */

export const a = 'hi!';
