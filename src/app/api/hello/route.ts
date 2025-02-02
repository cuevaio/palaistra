import { db } from '@/db';

export const POST = async () => {
  try {
    const students = await db.query.user.findMany({
      where: (user, { like }) => like(user.name, 'Ant%')
    });

    return Response.json({ students });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
};

export const GET = async () => {
  try {
    const users = await db.query.user.findMany();

    return Response.json({ users });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
};
