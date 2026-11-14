import { NextResponse } from 'next/server';
import { getAllResultItems, getLastUpdated } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getAllResultItems();
    const lastUpdated = await getLastUpdated();

    return NextResponse.json(
      {
        success: true,
        items,
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
