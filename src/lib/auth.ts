import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { adminSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SESSION_COOKIE_NAME = 'admin_session';
const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const envUsername = process.env.username;
  const envPassword = process.env.password;

  if (!envUsername || !envPassword) {
    throw new Error('Admin credentials not configured');
  }

  // For production, we should hash the password in env
  // For now, using direct comparison as per requirements
  return username === envUsername && password === envPassword;
}

export async function createSession(
  userId: string,
  rememberMe: boolean = false
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const duration = rememberMe ? REMEMBER_ME_DURATION : DEFAULT_SESSION_DURATION;
  const expiresAt = new Date(Date.now() + duration);

  await db.insert(adminSessions).values({
    token,
    userId,
    expiresAt,
    rememberMe: rememberMe ? 'true' : 'false',
  });

  return token;
}

export async function getSession(
  token: string
): Promise<{ userId: string; expiresAt: Date } | null> {
  const sessions = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.token, token))
    .limit(1);

  if (sessions.length === 0) {
    return null;
  }

  const session = sessions[0];

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await deleteSession(token);
    return null;
  }

  return {
    userId: session.userId,
    expiresAt: session.expiresAt,
  };
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

export async function getCurrentSession(): Promise<{
  userId: string;
  expiresAt: Date;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return getSession(token);
}

export async function setSessionCookie(token: string, rememberMe: boolean): Promise<void> {
  const cookieStore = await cookies();
  const maxAge = rememberMe
    ? REMEMBER_ME_DURATION / 1000
    : DEFAULT_SESSION_DURATION / 1000;

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
