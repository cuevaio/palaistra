import Link from 'next/link';

import { eq } from 'drizzle-orm';

import { db, schema } from '@/db';
import { pdi_id } from '@/db/pdi/constants';

import { buttonVariants } from '@/components/ui/button';
import { LocalTime } from '@/components/localtime';

import { cn } from '@/lib/utils';

import CopyLinkButton from './copy-link';
import { CreateLinkForm } from './create-link';

export default async function UsersPage() {
  const invites = await db
    .select()
    .from(schema.student_invite)
    .where(eq(schema.student_invite.palaistra_id, pdi_id));

  return (
    <div className="container mx-auto my-8">
      <h1 className="text-xl font-bold">Links de inscripción</h1>
      <CreateLinkForm />

      <div className="mt-4 flex flex-col gap-4">
        {invites.map((invite) => (
          <div key={invite.id} className="rounded-xl border p-2 space-y-2">
            <p>Para: {invite.recipient_name}</p>
            <Link href={`/students/register?key=${invite.id}`}>
              https://pdi.palaistra.com.pe/students/register?key={invite.id}
            </Link>
            <p>
              Creado: <LocalTime time={invite.created_at} />
            </p>
            <CopyLinkButton
              link={`https://pdi.palaistra.com.pe/students/register?key=${invite.id}`}
            />
            {invite.student_id && (
              <Link
                href={`/${invite.student_id}`}
                className={cn(buttonVariants({ variant: 'secondary' }))}
              >
                Ver usuario registrado
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
