import { Role } from '@/lib/constants';
import { id } from '@/lib/nanoid';
import { resend } from '@/lib/resend';

import { db, schema } from '..';
import { redis } from '../redis';
import { MembershipInsert } from '../schema';
import { pdi_id } from './constants';
import { WelcomeTeacher } from './email-teachers';
import { createQR } from './store-qr';

const teachers: {
  name: string;
  email: string;
  id: string;
  national_id: string | null;
}[] = [
  {
    email: 'vadrimerino1@gmail.com',
    name: 'VALERIA ADRIANA MERINO ARAGÓN',
    dni: '72429244',
  },
  {
    email: 'alejandrohuisa474@gmail.com',
    name: 'Miguel Alejandro Vasquez Huisa',
    dni: '007704430',
  },
  {
    email: 'kleidimarortiz@gmail.com',
    name: 'KLEIDIMAR ORTIZ HERNÁNDEZ',
    dni: '004824094',
  },
].map((x) => ({
  id: id(),
  email: x.email.toLowerCase(),
  name: x.name
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' '),
  national_id: x.dni,
}));

await db.insert(schema.user).values(teachers);
await db.insert(schema.membership).values(
  teachers.map(
    (teacher) =>
      ({
        palaistra_id: pdi_id,
        user_id: teacher.id,
        roles: ['teacher'],
      }) satisfies MembershipInsert,
  ),
);

await Promise.all(
  teachers.map(async (teacher) => {
    await redis.set(`email:${teacher.email}:user:id`, teacher.id);
    await redis.hset(`user:${teacher.id}`, teacher);
    await redis.sadd<Role>(`membership|${teacher.id}|${pdi_id}`, 'teacher');
    const qr_url = await createQR(`https://pdi.palaistra.com.pe/${teacher.id}`);

    await resend.emails.send({
      from: 'PDI x Palaistra <pdi@updates.palaistra.com.pe>',
      to: [teacher.email],
      subject:
        'Registro de Asistencia para Profesores PDI verano 2025 [Información Importante]',
      react: <WelcomeTeacher qr_url={qr_url!} name={teacher.name} />,
    });
  }),
);
