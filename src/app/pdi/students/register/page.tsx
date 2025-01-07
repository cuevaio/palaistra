'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  CalendarDate,
  getLocalTimeZone,
  parseDuration,
  today,
} from '@internationalized/date';
import { Loader2Icon } from 'lucide-react';
import { Form } from 'react-aria-components';

import { Button } from '@/components/ui/button';
import { Checkbox, JollyCheckboxGroup } from '@/components/ui/jolly/checkbox';
import { JollyDatePicker } from '@/components/ui/jolly/date-picker';
import { JollySelect, SelectItem } from '@/components/ui/jolly/select';
import { JollyTextField } from '@/components/ui/jolly/textfield';

import pdi_logo from '../../logo-pdi.jpg';
import { registerStudent } from './action';

const Page = () => {
  const [bDate, setBDate] = React.useState<CalendarDate | null>();

  const [parentIsRequired, setParentIsRequired] = React.useState(false);
  const [state, action, isPending] = React.useActionState(
    registerStudent,
    null,
  );
  React.useEffect(() => {
    if (!bDate) {
      setParentIsRequired(false);
    } else {
      setParentIsRequired(
        today(getLocalTimeZone())
          .subtract(parseDuration('P18Y'))
          .compare(bDate) < 0,
      );
    }
  }, [setParentIsRequired, bDate]);

  const router = useRouter();

  React.useEffect(() => {
    if (state?.success) {
      router.push(`/${state.data.student_id}`);
    }
  }, [state, router]);

  return (
    <Form
      key={JSON.stringify(state?.form)}
      className="mx-auto mb-8 flex max-w-64 flex-col gap-4"
      action={action}
      autoComplete="on"
    >
      <Image
        src={pdi_logo}
        width={200}
        height={200}
        alt="PDI logo"
        className="m-10"
      />
      <h1 className="text-center text-xl font-bold">Registrar alumno</h1>
      <JollyTextField
        defaultValue={state?.form?.name}
        name="name"
        isRequired
        label="Nombre del alumno"
      />

      <JollyTextField
        defaultValue={state?.form?.national_id}
        name="national_id"
        isRequired
        label="DNI del alumno"
      />

      <JollyDatePicker
        name="birth_date"
        isRequired
        label="Fecha de nacimiento del alumno"
        value={bDate}
        onChange={setBDate}
      />

      {parentIsRequired && (
        <>
          <JollyTextField
            defaultValue={state?.form?.parent_name}
            name="parent_name"
            label="Nombre del apoderado"
            isRequired
          />
          <JollyTextField
            defaultValue={state?.form?.parent_national_id}
            name="parent_national_id"
            isRequired
            label="DNI del apoderado"
          />
        </>
      )}

      <JollyTextField
        defaultValue={state?.form?.email}
        name="email"
        type="email"
        label={`Email del ${parentIsRequired ? 'apoderado' : 'alumno'}`}
        isRequired
      />

      <JollySelect
        defaultSelectedKey={state?.form?.hour_start}
        isRequired
        className="group w-[200px]"
        name="hour_start"
        placeholder="Selecciona"
        label="Hora de entrada"
        description="Selecciona la hora de entrada contratada"
      >
        <SelectItem id={'13:00:00'}>13:00</SelectItem>
        <SelectItem id={'13:15:00'}>13:15</SelectItem>
        <SelectItem id={'14:00:00'}>14:00</SelectItem>
        <SelectItem id={'14:15:00'}>14:15</SelectItem>
        <SelectItem id={'15:00:00'}>15:00</SelectItem>
        <SelectItem id={'18:00:00'}>18:00</SelectItem>
        <SelectItem id={'19:00:00'}>19:00</SelectItem>
      </JollySelect>

      <JollySelect
        defaultSelectedKey={state?.form?.hour_end}
        isRequired
        className="group w-[200px]"
        name="hour_end"
        placeholder="Selecciona"
        label="Hora de salida"
        description="Selecciona la hora de salida contratada"
      >
        <SelectItem id={'14:00:00'}>14:00</SelectItem>
        <SelectItem id={'15:00:00'}>15:00</SelectItem>
        <SelectItem id={'17:00:00'}>17:00</SelectItem>
        <SelectItem id={'19:00:00'}>19:00</SelectItem>
        <SelectItem id={'20:00:00'}>20:00</SelectItem>
      </JollySelect>

      <JollyCheckboxGroup
        description="Selecciona los días contratados"
        label="Días"
        isRequired
        name="days"
        defaultValue={state?.form?.days}
      >
        <Checkbox value="L">Lunes</Checkbox>
        <Checkbox value="M">Martes</Checkbox>
        <Checkbox value="X">Miércoles</Checkbox>
        <Checkbox value="J">Jueves</Checkbox>
        <Checkbox value="V">Viernes</Checkbox>
        <Checkbox value="S">Sábado</Checkbox>
        <Checkbox value="D">Domingo</Checkbox>
      </JollyCheckboxGroup>

      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending && <Loader2Icon className="mr-2 animate-spin" />}
        Matricular
      </Button>
    </Form>
  );
};

export default Page;
