import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';
import { getResultItemById, updateResultItem, deleteResultItem } from '@/lib/db';
import { eventBroadcaster } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const item = await getResultItemById(params.id);
  if (!item) {
    return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, item });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing = await getResultItemById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    const updated = await updateResultItem(params.id, {
      category: body.category !== undefined ? body.category.trim() : existing.category,
      round: body.round !== undefined ? body.round.trim() : existing.round,
      segment: body.segment !== undefined ? (body.segment ? body.segment.trim() : null) : existing.segment,
      description: body.description !== undefined ? (body.description ? body.description.trim() : null) : existing.description,
      display_order: body.display_order !== undefined ? Number(body.display_order) : existing.display_order,
      first_place_name: body.first_place_name !== undefined ? (body.first_place_name ? body.first_place_name.trim() : null) : existing.first_place_name,
      first_place_details: body.first_place_details !== undefined ? (body.first_place_details ? body.first_place_details.trim() : null) : existing.first_place_details,
      first_place_score: body.first_place_score !== undefined ? (body.first_place_score ? body.first_place_score.trim() : null) : existing.first_place_score,
      second_place_name: body.second_place_name !== undefined ? (body.second_place_name ? body.second_place_name.trim() : null) : existing.second_place_name,
      second_place_details: body.second_place_details !== undefined ? (body.second_place_details ? body.second_place_details.trim() : null) : existing.second_place_details,
      second_place_score: body.second_place_score !== undefined ? (body.second_place_score ? body.second_place_score.trim() : null) : existing.second_place_score,
      third_place_name: body.third_place_name !== undefined ? (body.third_place_name ? body.third_place_name.trim() : null) : existing.third_place_name,
      third_place_details: body.third_place_details !== undefined ? (body.third_place_details ? body.third_place_details.trim() : null) : existing.third_place_details,
      third_place_score: body.third_place_score !== undefined ? (body.third_place_score ? body.third_place_score.trim() : null) : existing.third_place_score,
      notes: body.notes !== undefined ? (body.notes ? body.notes.trim() : null) : existing.notes,
    });

    eventBroadcaster.broadcast('item-updated');

    return NextResponse.json({
      success: true,
      item: updated,
      message: 'Result updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating result item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update result item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const success = await deleteResultItem(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    eventBroadcaster.broadcast('item-deleted');

    return NextResponse.json({
      success: true,
      message: 'Result item deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting result item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
