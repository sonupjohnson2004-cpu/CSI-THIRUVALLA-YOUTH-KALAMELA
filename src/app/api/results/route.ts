import { NextRequest, NextResponse } from 'next/server';
import { getAllResultItems, getLastUpdated, getAllEditions, getActiveEditionId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const requestedEdition = req.nextUrl.searchParams.get('edition') || undefined;
    const activeEditionId = await getActiveEditionId();
    const editions = await getAllEditions();
    const items = await getAllResultItems(requestedEdition);
    const lastUpdated = await getLastUpdated();

    return NextResponse.json(
      {
        success: true,
        items,
        editions,
        activeEditionId,
        selectedEditionId: requestedEdition || activeEditionId,
        lastUpdated,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching public results:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve results',
      },
      { status: 500 }
    );
  }
}
