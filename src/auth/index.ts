import { cache } from 'react';
import { cookies } from 'next/headers';

import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';

import { redis } from '@/db/redis';

import {
  SESSION_TOKEN_COOKIE_EXPIRES_IN_S,
  SESSION_TOKEN_COOKIE_NAME,
} from './constants';
import { Session, User } from './types';
import { validateSessionToken } from './utils';

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * SESSION_TOKEN_COOKIE_EXPIRES_IN_S), // 30 days
  };

  await redis.hset(`session:${session.id}`, session);
  await redis.expire(
    `session:${session.id}`,
    SESSION_TOKEN_COOKIE_EXPIRES_IN_S,
  ); // 30 days
  return session;
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await redis.hdel(`session:${sessionId}`);
}

export async function setSessionTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 1000 * SESSION_TOKEN_COOKIE_EXPIRES_IN_S),
    path: '/',
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}

export const getSession = cache(async () => {
  const sessionToken = (await cookies()).get(SESSION_TOKEN_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  return await validateSessionToken(sessionToken);
});

export const getUserAndSession = cache(async () => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await redis.hgetall<User>(`user:${session.userId}`);
  if (!user) {
    return null;
  }

  return { session, user };
});
