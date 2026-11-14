import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSessionFromRequest } from '@/lib/auth';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await checkAdminSessionFromRequest(req);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheets = workbook.SheetNames;
    if (sheets.length === 0) {
      return NextResponse.json({ success: false, error: 'Excel file contains no sheets' }, { status: 400 });
    }

    // Default to first sheet or allow client to request a specific sheet
    const defaultSheet = sheets[0];
    const worksheet = workbook.Sheets[defaultSheet];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (jsonData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Worksheet is completely empty',
        sheets,
      }, { status: 400 });
    }

    // First non-empty row as headers
    let headerRowIndex = 0;
    while (
      headerRowIndex < jsonData.length &&
      (!Array.isArray(jsonData[headerRowIndex]) || jsonData[headerRowIndex].every((c: any) => !String(c).trim()))
    ) {
      headerRowIndex++;
    }

    if (headerRowIndex >= jsonData.length) {
      return NextResponse.json({
        success: false,
        error: 'No valid header row found in sheet',
        sheets,
      }, { status: 400 });
    }

    const rawHeaders: string[] = jsonData[headerRowIndex].map((h: any, idx: number) => {
      const str = String(h || '').trim();
      return str || `Column_${idx + 1}`;
    });

    // Sample data rows (up to 50 rows)
    const rawRows = jsonData.slice(headerRowIndex + 1).filter((row: any[]) =>
      row.some((cell: any) => String(cell || '').trim().length > 0)
    );

    // Initial smart auto-mapping suggestions based on common column naming patterns
    const suggestedMapping: Record<string, string> = {
      category: '',
      round: '',
      segment: '',
      first_place_name: '',
      first_place_details: '',
      first_place_score: '',
      second_place_name: '',
      second_place_details: '',
      second_place_score: '',
      third_place_name: '',
      third_place_details: '',
      third_place_score: '',
      notes: '',
    };

    rawHeaders.forEach((header) => {
      const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (!suggestedMapping.category && (h.includes('category') || h.includes('event') || h.includes('item') || h.includes('competition') || h.includes('title'))) {
        suggestedMapping.category = header;
      } else if (!suggestedMapping.round && (h.includes('round') || h.includes('stage') || h.includes('level'))) {
        suggestedMapping.round = header;
      } else if (!suggestedMapping.segment && (h.includes('segment') || h.includes('session') || h.includes('venue') || h.includes('slot'))) {
        suggestedMapping.segment = header;
      } else if (h.includes('1st') || h.includes('first') || h.includes('gold')) {
        if (h.includes('score') || h.includes('point') || h.includes('mark')) {
          suggestedMapping.first_place_score = header;
        } else if (h.includes('detail') || h.includes('school') || h.includes('team') || h.includes('song')) {
          suggestedMapping.first_place_details = header;
        } else if (!suggestedMapping.first_place_name) {
          suggestedMapping.first_place_name = header;
        }
      } else if (h.includes('2nd') || h.includes('second') || h.includes('silver')) {
        if (h.includes('score') || h.includes('point') || h.includes('mark')) {
          suggestedMapping.second_place_score = header;
        } else if (h.includes('detail') || h.includes('school') || h.includes('team') || h.includes('song')) {
          suggestedMapping.second_place_details = header;
        } else if (!suggestedMapping.second_place_name) {
          suggestedMapping.second_place_name = header;
        }
      } else if (h.includes('3rd') || h.includes('third') || h.includes('bronze')) {
        if (h.includes('score') || h.includes('point') || h.includes('mark')) {
          suggestedMapping.third_place_score = header;
        } else if (h.includes('detail') || h.includes('school') || h.includes('team') || h.includes('song')) {
          suggestedMapping.third_place_details = header;
        } else if (!suggestedMapping.third_place_name) {
          suggestedMapping.third_place_name = header;
        }
      } else if (!suggestedMapping.notes && (h.includes('note') || h.includes('remark') || h.includes('comment'))) {
        suggestedMapping.notes = header;
      }
    });

    // Convert raw rows to objects using rawHeaders
    const rowsAsObjects = rawRows.map((r: any[]) => {
      const obj: Record<string, string> = {};
      rawHeaders.forEach((col, idx) => {
        obj[col] = String(r[idx] ?? '').trim();
      });
      return obj;
    });

    return NextResponse.json({
      success: true,
      sheets,
      selectedSheet: defaultSheet,
      headers: rawHeaders,
      suggestedMapping,
      totalRows: rowsAsObjects.length,
      sampleRows: rowsAsObjects.slice(0, 10),
      allRows: rowsAsObjects,
    });
  } catch (error: any) {
    console.error('Error parsing Excel:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to parse Excel file' }, { status: 500 });
  }
}
