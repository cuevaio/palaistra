import Image from 'next/image';

import loginImage from './pexels-spaceshipguy-16381486.jpg';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen w-screen grid-cols-2">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold">PDI</h1>
        <p className="text-sm text-muted-foreground">Escuela de natación</p>

        {children}
      </div>
      <div className="relative">
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
