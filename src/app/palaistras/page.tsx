import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { db } from '@/db';

import { buttonVariants } from '@/components/ui/button';

const Page = async () => {
  const auth = await getUserAndSession();
  if (!auth) redirect('/signin');

  const memberships = await db.query.membership.findMany({
    where: (membership, { eq }) => eq(membership.user_id, auth.user.id),
    with: {
      palaistra: true,
    },
  });

  return (
    <div className="container mx-auto my-8 flex flex-col gap-4">
      <div>
        <Link href="/new" className={buttonVariants({ variant: 'outline' })}>
          Nueva palaistra
        </Link>
      </div>
      <div className="flex space-x-4">
        {memberships.map(({ palaistra }) => (
          <Link
            href={`/${palaistra.id}`}
            key={palaistra.id}
            className="flex h-24 items-center gap-4 overflow-hidden rounded-xl border p-4"
          >
            {palaistra.pic_url && (
              <span className="relative aspect-square h-full">
                <Image
                  src={palaistra.pic_url}
                  fill
                  className="object-cover"
                  alt="Profile picture"
                />
              </span>
            )}
            <span className="text-xl font-bold">{palaistra.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
