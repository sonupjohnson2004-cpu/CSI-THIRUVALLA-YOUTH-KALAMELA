import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await checkAdminSessionFromRequest(req);
  return NextResponse.json({
    authenticated: session.authenticated,
    username: session.username || null,
  });
}
