import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';
import { getAllEditions, createEdition, getActiveEditionId } from '@/lib/db';
import { eventBroadcaster } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const editions = await getAllEditions();
    const activeEditionId = await getActiveEditionId();
    return NextResponse.json({ success: true, editions, activeEditionId });
  } catch (error: any) {
    console.error('Error fetching editions:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve editions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, year, cloneFromEditionId, setActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Show name is required' }, { status: 400 });
    }

    const yearNum = Number(year) || new Date().getFullYear() + 1;
    const newEdition = await createEdition(name.trim(), yearNum, cloneFromEditionId, Boolean(setActive));

    eventBroadcaster.broadcast('edition-created');

    return NextResponse.json({
      success: true,
      edition: newEdition,
      message: `Talent show edition "${newEdition.name}" created successfully.`,
    });
  } catch (error: any) {
    console.error('Error creating edition:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create show edition' }, { status: 500 });
  }
}
