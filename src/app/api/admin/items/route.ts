import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';
import { getAllResultItems, createResultItem } from '@/lib/db';
import { eventBroadcaster } from '@/lib/events';
import { ResultItemInput } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const items = await getAllResultItems();
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Error in admin GET /items:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      category,
      round,
      segment,
      description,
      display_order,
      first_place_name,
      first_place_details,
      first_place_score,
      second_place_name,
      second_place_details,
      second_place_score,
      third_place_name,
      third_place_details,
      third_place_score,
      notes,
    } = body;

    if (!category || !category.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const input: ResultItemInput = {
      category: category.trim(),
      round: (round && round.trim()) || 'Finals',
      segment: segment ? segment.trim() : null,
      description: description ? description.trim() : null,
      display_order: Number.isInteger(Number(display_order)) ? Number(display_order) : 0,
      status: 'pending',
      first_place_name: first_place_name ? first_place_name.trim() : null,
      first_place_details: first_place_details ? first_place_details.trim() : null,
      first_place_score: first_place_score ? first_place_score.trim() : null,
      second_place_name: second_place_name ? second_place_name.trim() : null,
      second_place_details: second_place_details ? second_place_details.trim() : null,
      second_place_score: second_place_score ? second_place_score.trim() : null,
      third_place_name: third_place_name ? third_place_name.trim() : null,
      third_place_details: third_place_details ? third_place_details.trim() : null,
      third_place_score: third_place_score ? third_place_score.trim() : null,
      notes: notes ? notes.trim() : null,
    };

    const newItem = await createResultItem(input);

    // Broadcast real-time update to all active viewers
    eventBroadcaster.broadcast('item-created');

    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Result item created successfully',
    });
  } catch (error: any) {
    console.error('Error creating result item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create result item' },
      { status: 500 }
    );
  }
}
