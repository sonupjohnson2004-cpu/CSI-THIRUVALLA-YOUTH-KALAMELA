import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const COOKIE_NAME = 'talent_admin_session';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'talent_show_default_secure_secret_key_2026_super_strong';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function createSessionToken(username: string): Promise<string> {
  const token = await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
  return token;
}

export async function verifySessionToken(token: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload && payload.role === 'admin' && typeof payload.username === 'string') {
      return { valid: true, username: payload.username };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export async function authenticateAdminCredentials(
  user: string,
  pass: string
): Promise<{ success: boolean; error?: string }> {
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'TalentAdmin2026!';

  if (!user || !pass) {
    return { success: false, error: 'Username and password are required' };
  }

  // Strict check on username
  if (user.trim() !== expectedUser.trim()) {
    return { success: false, error: 'Invalid username or password' };
  }

  // Support both plain text config (e.g. TalentAdmin2026!) or bcrypt hash ($2a$/$2b$)
  let isPasswordCorrect = false;
  if (expectedPass.startsWith('$2a$') || expectedPass.startsWith('$2b$')) {
    isPasswordCorrect = await bcrypt.compare(pass, expectedPass);
  } else {
    isPasswordCorrect = pass === expectedPass;
  }

  if (!isPasswordCorrect) {
    return { success: false, error: 'Invalid username or password' };
  }

  return { success: true };
}

export async function checkAdminSession(): Promise<{ authenticated: boolean; username?: string }> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return { authenticated: false };

  const verified = await verifySessionToken(token);
  if (!verified.valid) return { authenticated: false };

  return { authenticated: true, username: verified.username };
}

export async function checkAdminSessionFromRequest(
  req: NextRequest
): Promise<{ authenticated: boolean; username?: string }> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return { authenticated: false };

  const verified = await verifySessionToken(token);
  if (!verified.valid) return { authenticated: false };

  return { authenticated: true, username: verified.username };
}
