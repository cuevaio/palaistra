import Image from 'next/image';

import pdi_logo from '../pdi/logo-pdi.jpg';
import loginImage from './pexels-spaceshipguy-16381486.jpg';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen w-screen grid-cols-1 md:grid-cols-2">
      <div className="min- mx-auto flex max-w-md flex-col items-center justify-center gap-4">
        <Image
          src={pdi_logo}
          width={200}
          height={200}
          alt="PDI logo"
          className="-m-10"
        />
        <h1 className="text-xl font-bold">Inicia sesión en PDI</h1>

        {children}
      </div>
      <div className="relative hidden md:flex">
        <Image
          src={loginImage}
          alt="Login"
          className="object-cover"
          fill
          placeholder="blur"
        />
      </div>
    </div>
  );
}
