import { NextRequest } from 'next/server';

import { redis } from '@/db/redis';

import { SESSION_TOKEN_COOKIE_NAME } from './constants';
import { User } from './types';
import { validateSessionToken } from './utils';

export const nocache_getSession = async (request: NextRequest) => {
  const sessionToken = request.cookies.get(SESSION_TOKEN_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  return await validateSessionToken(sessionToken);
};

export const nocache_getUserAndSession = async (request: NextRequest) => {
  const session = await nocache_getSession(request);

  if (!session) {
    return null;
  }

  const user = await redis.hgetall<User>(`user:${session.userId}`);
  if (!user) {
    return null;
  }

  return { session, user };
};
