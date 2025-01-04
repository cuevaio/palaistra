import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

import { redis } from '@/db/redis';

import { SESSION_TOKEN_COOKIE_EXPIRES_IN_S } from './constants';
import { Session } from './types';

export async function validateSessionToken(
  token: string,
): Promise<Session | null> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  let session = await redis.hgetall<Session>(`session:${sessionId}`);

  if (!session) {
    return null;
  }
  session = {
    ...session,
    expiresAt: new Date(session.expiresAt),
  };

  if (Date.now() >= session.expiresAt.getTime()) {
    await redis.hdel(`session:${sessionId}`);
    return null;
  }

  if (
    Date.now() >=
    session.expiresAt.getTime() - (1000 * SESSION_TOKEN_COOKIE_EXPIRES_IN_S) / 2
  ) {
    // 15 days
    await redis.hset(`session:${session.id}`, {
      expiresAt:
        session.expiresAt.getTime() + 1000 * SESSION_TOKEN_COOKIE_EXPIRES_IN_S, // 30 days
    });
    await redis.expire(
      `session:${session.id}`,
      SESSION_TOKEN_COOKIE_EXPIRES_IN_S,
    ); // 30 days
  }
  return session;
}
