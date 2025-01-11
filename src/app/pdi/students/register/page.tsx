import { eq } from 'drizzle-orm';

import { db, schema } from '@/db';

import { RegisterStudentForm } from './client';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  let name: string | undefined = undefined;
  let id: string | undefined = undefined;

  if (typeof searchParams.key === 'string') {
    const [invite] = await db
      .select({
        id: schema.student_invite.id,
        name: schema.student_invite.recipient_name,
      })
      .from(schema.student_invite)
      .where(eq(schema.student_invite.id, searchParams.key));

    if (invite) {
      name = invite.name;
      id = invite.id;
    }
  }

  return <RegisterStudentForm id={id} name={name} />;
}
