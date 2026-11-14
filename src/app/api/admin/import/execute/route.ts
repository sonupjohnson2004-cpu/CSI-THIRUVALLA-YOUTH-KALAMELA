import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';
import { getAllResultItems, createResultItem, updateResultItem } from '@/lib/db';
import { eventBroadcaster } from '@/lib/events';
import { ImportPreviewItem, ResultItemInput } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, overwriteStrategy = 'fill_blank_only' } = body as {
      items: ImportPreviewItem[];
      overwriteStrategy: 'skip_existing' | 'overwrite_all' | 'fill_blank_only';
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'No items to import' }, { status: 400 });
    }

    const currentItems = await getAllResultItems();
    const existingMap = new Map<string, typeof currentItems[0]>();
    currentItems.forEach((item) => {
      const key = `${item.category.trim().toLowerCase()}_${item.round.trim().toLowerCase()}`;
      existingMap.set(key, item);
    });

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      if (item.status === 'error' || !item.category) {
        skippedCount++;
        continue;
      }

      const lookupKey = `${item.category.trim().toLowerCase()}_${(item.round || 'Finals').trim().toLowerCase()}`;
      const existing = existingMap.get(lookupKey);

      if (existing) {
        if (overwriteStrategy === 'skip_existing') {
          skippedCount++;
          continue;
        }

        if (overwriteStrategy === 'fill_blank_only') {
          const updatePayload: Partial<ResultItemInput> = {};
          let hasChanges = false;

          if (!existing.first_place_name && item.first_place_name) {
            updatePayload.first_place_name = item.first_place_name;
            updatePayload.first_place_details = item.first_place_details || null;
            updatePayload.first_place_score = item.first_place_score || null;
            hasChanges = true;
          }
          if (!existing.second_place_name && item.second_place_name) {
            updatePayload.second_place_name = item.second_place_name;
            updatePayload.second_place_details = item.second_place_details || null;
            updatePayload.second_place_score = item.second_place_score || null;
            hasChanges = true;
          }
          if (!existing.third_place_name && item.third_place_name) {
            updatePayload.third_place_name = item.third_place_name;
            updatePayload.third_place_details = item.third_place_details || null;
            updatePayload.third_place_score = item.third_place_score || null;
            hasChanges = true;
          }
          if (!existing.notes && item.notes) {
            updatePayload.notes = item.notes;
            hasChanges = true;
          }

          if (hasChanges) {
            await updateResultItem(existing.id, updatePayload);
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else if (overwriteStrategy === 'overwrite_all') {
          await updateResultItem(existing.id, {
            category: item.category,
            round: item.round || 'Finals',
            segment: item.segment || existing.segment,
            first_place_name: item.first_place_name || null,
            first_place_details: item.first_place_details || null,
            first_place_score: item.first_place_score || null,
            second_place_name: item.second_place_name || null,
            second_place_details: item.second_place_details || null,
            second_place_score: item.second_place_score || null,
            third_place_name: item.third_place_name || null,
            third_place_details: item.third_place_details || null,
            third_place_score: item.third_place_score || null,
            notes: item.notes || existing.notes,
          });
          updatedCount++;
        }
      } else {
        // Create new item
        const input: ResultItemInput = {
          category: item.category,
          round: item.round || 'Finals',
          segment: item.segment || null,
          description: null,
          display_order: insertedCount + currentItems.length + 1,
          status: 'pending',
          first_place_name: item.first_place_name || null,
          first_place_details: item.first_place_details || null,
          first_place_score: item.first_place_score || null,
          second_place_name: item.second_place_name || null,
          second_place_details: item.second_place_details || null,
          second_place_score: item.second_place_score || null,
          third_place_name: item.third_place_name || null,
          third_place_details: item.third_place_details || null,
          third_place_score: item.third_place_score || null,
          notes: item.notes || null,
        };

        const created = await createResultItem(input);
        existingMap.set(lookupKey, created);
        insertedCount++;
      }
    }

    // Broadcast real-time update
    eventBroadcaster.broadcast('excel-import-completed');

    return NextResponse.json({
      success: true,
      insertedCount,
      updatedCount,
      skippedCount,
      totalProcessed: items.length,
      message: `Import applied successfully: ${insertedCount} added, ${updatedCount} updated, ${skippedCount} skipped.`,
    });
  } catch (error: any) {
    console.error('Error executing import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Import execution failed' },
      { status: 500 }
    );
  }
}
