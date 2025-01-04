import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

const Page = async () => {
  const auth = await getUserAndSession();

  if (!auth) redirect('/signin');

  const { user } = auth;

  redirect(`/${user.id}`);

  return <div>Hello!</div>;
};

export default Page;
