import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';
import { setActiveEdition } from '@/lib/db';
import { eventBroadcaster } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const success = await setActiveEdition(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Edition not found' }, { status: 404 });
    }

    eventBroadcaster.broadcast('edition-activated');

    return NextResponse.json({
      success: true,
      message: 'Active talent show edition updated successfully.',
    });
  } catch (error: any) {
    console.error('Error activating edition:', error);
    return NextResponse.json({ success: false, error: 'Failed to activate edition' }, { status: 500 });
  }
}
