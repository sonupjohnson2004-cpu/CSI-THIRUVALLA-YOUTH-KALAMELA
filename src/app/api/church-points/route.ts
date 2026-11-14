import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import path from 'path';
import { getActiveEditionId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const requestedEdition = req.nextUrl.searchParams.get('edition') || (await getActiveEditionId());
    const dbPath = path.resolve(process.cwd(), 'data', 'talent_show.db');
    const client = createClient({ url: `file:${dbPath}` });

    const res = await client.execute({
      sql: `SELECT * FROM church_points WHERE edition_id = ? ORDER BY total_points DESC, unit_name ASC`,
      args: [requestedEdition],
    });

    const churches = res.rows.map((r: any) => ({
      id: r.id,
      edition_id: r.edition_id,
      sl_no: r.sl_no,
      section: r.section,
      unit_name: r.unit_name,
      total_points: Number(r.total_points ?? 0),
      event_scores: r.event_scores ? JSON.parse(String(r.event_scores)) : {},
      rank: Number(r.rank ?? 0),
    }));

    return NextResponse.json({
      success: true,
      churches,
      editionId: requestedEdition,
    });
  } catch (error: any) {
    console.error('Error fetching church points:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch church points' },
      { status: 500 }
    );
  }
}
