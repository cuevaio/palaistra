import { redirect } from 'next/navigation';

import { getUserAndSession } from '@/auth';

import { QRCode } from './[user_id]/qr';

const Page = async () => {
  const auth = await getUserAndSession();

  if (!auth) redirect('/signin');

  const { user } = auth;

  return (
    <div>
      <div>{user.email}</div>
      <div>{user.name}</div>
      <QRCode id={user.id} name={user.name} email={user.email} />
    </div>
  );
};

export default Page;
