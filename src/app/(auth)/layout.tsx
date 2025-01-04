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
        <h1 className="text-xl font-bold">Ready to loose some weight?</h1>
        <p className="text-sm text-muted-foreground">
          Join hundreds of folks loosing weight together{' '}
        </p>

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
