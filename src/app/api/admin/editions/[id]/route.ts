import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';
import { deleteEdition } from '@/lib/db';
import { eventBroadcaster } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const success = await deleteEdition(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Edition not found' }, { status: 404 });
    }

    eventBroadcaster.broadcast('edition-deleted');

    return NextResponse.json({
      success: true,
      message: 'Edition deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting edition:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete edition' }, { status: 500 });
  }
}
