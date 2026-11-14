import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';
import { getAllResultItems } from '@/lib/db';
import { ExcelColumnMapping, ImportPreviewItem, ImportValidationSummary } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { rows, mapping } = body as {
      rows: Record<string, string>[];
      mapping: ExcelColumnMapping;
    };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No data rows provided' }, { status: 400 });
    }

    if (!mapping || !mapping.category) {
      return NextResponse.json(
        { success: false, error: 'Category column mapping is required' },
        { status: 400 }
      );
    }

    const existingItems = await getAllResultItems();
    const existingMap = new Map<string, typeof existingItems[0]>();
    existingItems.forEach((item) => {
      const key = `${item.category.trim().toLowerCase()}_${item.round.trim().toLowerCase()}`;
      existingMap.set(key, item);
    });

    const previewList: ImportPreviewItem[] = [];
    let validCount = 0;
    let conflictCount = 0;
    let errorCount = 0;

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // Accounting for 1-based index and header row
      const category = (row[mapping.category] || '').trim();
      const round = mapping.round && row[mapping.round] ? row[mapping.round].trim() : 'Finals';
      const segment = mapping.segment && row[mapping.segment] ? row[mapping.segment].trim() : '';

      const first_place_name = mapping.first_place_name && row[mapping.first_place_name] ? row[mapping.first_place_name].trim() : '';
      const first_place_details = mapping.first_place_details && row[mapping.first_place_details] ? row[mapping.first_place_details].trim() : '';
      const first_place_score = mapping.first_place_score && row[mapping.first_place_score] ? row[mapping.first_place_score].trim() : '';

      const second_place_name = mapping.second_place_name && row[mapping.second_place_name] ? row[mapping.second_place_name].trim() : '';
      const second_place_details = mapping.second_place_details && row[mapping.second_place_details] ? row[mapping.second_place_details].trim() : '';
      const second_place_score = mapping.second_place_score && row[mapping.second_place_score] ? row[mapping.second_place_score].trim() : '';

      const third_place_name = mapping.third_place_name && row[mapping.third_place_name] ? row[mapping.third_place_name].trim() : '';
      const third_place_details = mapping.third_place_details && row[mapping.third_place_details] ? row[mapping.third_place_details].trim() : '';
      const third_place_score = mapping.third_place_score && row[mapping.third_place_score] ? row[mapping.third_place_score].trim() : '';

      const notes = mapping.notes && row[mapping.notes] ? row[mapping.notes].trim() : '';

      const errors: string[] = [];
      const warnings: string[] = [];

      if (!category) {
        errors.push('Category name is empty');
      }

      const lookupKey = `${category.toLowerCase()}_${round.toLowerCase()}`;
      const existing = existingMap.get(lookupKey);

      let status: 'new' | 'existing_conflict' | 'error' = 'new';

      if (errors.length > 0) {
        status = 'error';
        errorCount++;
      } else if (existing) {
        status = 'existing_conflict';
        conflictCount++;
        warnings.push(`Matches existing item "${existing.category}" (${existing.round})`);
        if (existing.first_place_name && first_place_name && existing.first_place_name !== first_place_name) {
          warnings.push(`1st Place differs: Current "${existing.first_place_name}" vs Import "${first_place_name}"`);
        }
      } else {
        status = 'new';
        validCount++;
      }

      previewList.push({
        rowNumber,
        category,
        round,
        segment,
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
        status,
        existingItem: existing,
        errors,
        warnings,
      });
    });

    const summary: ImportValidationSummary = {
      totalRows: rows.length,
      validRows: validCount,
      conflictRows: conflictCount,
      errorRows: errorCount,
      preview: previewList,
    };

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Validation failed' }, { status: 500 });
  }
}
