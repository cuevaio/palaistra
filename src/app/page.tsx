import Image from 'next/image';
import Link from 'next/link';

import { Dumbbell } from 'lucide-react';

import { Button } from '@/components/ui/button';

import pic from './pexels-jim-de-ramos-395808-1263349.jpg';
import { RegisterForm } from './register-form';

export default function PalaistraLanding() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-14 items-center px-4 lg:px-6">
        <Link className="flex items-center justify-center" href="#">
          <Dumbbell className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-blue-600">
            Palaistra
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#contact"
          >
            Contacto
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full bg-blue-50 py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Empoderando a las Instituciones Deportivas con Soluciones
                    Tecnológicas de Vanguardia
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Palaistra proporciona tecnología innovadora para optimizar
                    operaciones, mejorar el rendimiento y elevar la experiencia
                    deportiva para instituciones de todos los tamaños.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">Comenzar</Button>
                  <Button size="lg" variant="outline">
                    Saber Más
                  </Button>
                </div>
              </div>
              <Image
                alt="Tecnología Deportiva"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                height="550"
                src={pic}
                width="550"
              />
            </div>
          </div>
        </section>
        <section className="w-full bg-white py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 id="contact" className="mb-8 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              ¿Interesado en Nuestras Soluciones?
            </h2>
            <RegisterForm />
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500">
          © 2023 Palaistra. Todos los derechos reservados.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
