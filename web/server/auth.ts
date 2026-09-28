import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export type Role = 'lead' | 'sic';
export interface Session {
  /** 'lead' for the ministry lead, otherwise a minister id. */
  sub: string;
  role: Role;
  exp: number;
}

export const COOKIE = 'ek_session';
const MAX_AGE = 60 * 60 * 24 * 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length);
  return timingSafeEqual(expected, actual);
}

/** Constant-time comparison for the lead password kept in an environment variable. */
export function equalSecret(a: string, b: string) {
  const ha = createHmac('sha256', 'cmp').update(a).digest();
  const hb = createHmac('sha256', 'cmp').update(b).digest();
  return timingSafeEqual(ha, hb);
}

const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('base64url');

export function sessionCookie(s: Omit<Session, 'exp'>, secret: string, secure: boolean) {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Math.floor(Date.now() / 1000) + MAX_AGE })).toString('base64url');
  const value = `${payload}.${sign(payload, secret)}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure ? '; Secure' : ''}`;
}

export function clearCookie(secure: boolean) {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}

export function readSession(cookieHeader: string | null, secret: string): Session | null {
  const raw = cookieHeader
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload, secret);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session;
    return s.exp > Date.now() / 1000 ? s : null;
  } catch {
    return null;
  }
}
