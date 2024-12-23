'use client';

import React from 'react';

import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { register } from './register-contact.action';

export const RegisterForm = () => {
  const [state, action, pending] = React.useActionState(register, null);

  React.useEffect(() => {
    if (state?.ok) {
      toast.success(
        `Gracias, ${state.form.name?.split(' ')[0]}! Te contactaremos pronto.`,
      );
    } else {
      console.log(state?.error);
    }
  }, [state]);

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ingrese su nombre"
            required
            defaultValue={state?.form.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Nombre de la Empresa</Label>
          <Input
            id="company"
            name="company"
            placeholder="Ingrese el nombre de su empresa"
            required
            defaultValue={state?.form.company}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            name="email"
            placeholder="Ingrese su correo electrónico"
            required
            type="email"
            defaultValue={state?.form.email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Número de Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="Ingrese su número de teléfono"
            type="tel"
            defaultValue={state?.form.phone}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="students">Número de Estudiantes</Label>
          <Input
            id="students"
            name="students"
            placeholder="Ingrese el número de estudiantes"
            type="number"
            defaultValue={state?.form.students}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teachers">Número de Profesores</Label>
          <Input
            id="teachers"
            name="teachers"
            placeholder="Ingrese el número de profesores"
            type="number"
            defaultValue={state?.form.teachers}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Información Adicional</Label>
        <textarea
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          id="message"
          name="message"
          placeholder="¿Algún detalle o pregunta adicional?"
          defaultValue={state?.form.message}
        />
      </div>
      <Button className="w-full" size="lg" type="submit" disabled={pending}>
        {pending && <Loader2Icon className="size-4 animate-spin" />}
        Enviar
      </Button>
    </form>
  );
};
