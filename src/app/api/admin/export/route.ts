import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import path from 'path';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

function parseDetails(details: string | null) {
  if (!details) return { chest: '', unit: '' };
  let chest = '';
  let unit = '';
  const chestMatch = details.match(/Chest\s*#?\s*([A-Za-z0-9]+)/i);
  if (chestMatch) chest = chestMatch[1];
  const unitMatch = details.match(/Unit:\s*([^•\n\r]+)/i);
  if (unitMatch) unit = unitMatch[1].trim();
  return { chest, unit };
}

export async function GET() {
  try {
    const dbPath = path.resolve(process.cwd(), 'data', 'talent_show.db');
    const client = createClient({ url: `file:${dbPath}` });

    // 1. Fetch all result items in order
    const itemsRes = await client.execute(`
      SELECT * FROM result_items ORDER BY display_order ASC
    `);

    // 2. Fetch church points
    const churchRes = await client.execute(`
      SELECT * FROM church_points ORDER BY sl_no ASC
    `);

    const items = itemsRes.rows;
    const churches = churchRes.rows;

    // Build Master Sheet Grid (Exact 2-column layout as user provided)
    const grid: any[][] = [];
    grid.push(['RESULT']);
    grid.push([]);

    // Defined pairs of events matching user's layout
    const eventPairs: Array<[number, number | null]> = [
      [1, null], // Solo Western Senior Girls
      [2, null], // Short Story English
      [3, 4],    // Light Music Boys & Solo Eastern Senior Boys
      [5, 6],    // Light Music Girls & Quartet
      [7, 8],    // Solo Western Junior Boys & Elocution Malayalam Senior
      [9, 10],   // Solo Eastern Junior Boys & Pencil Drawing
      [11, 12],  // Solo Western Senior Boys & Cartoon
      [13, 14],  // Solo Eastern Junior Girls & Water Colour
      [15, 16],  // Solo Eastern Senior Girls & Poetry Writing Malayalam
      [17, 18],  // Solo Western Junior Girls & Essay Malayalam Junior
      [19, 20],  // Elocution Malayalam Junior & Percussion
      [21, 22],  // Elocution English Senior & Group Song
      [23, 24],  // Elocution English Junior & Organ
      [25, 26],  // Violin & Wind
      [27, 28],  // Short Story Malayalam & Mimicry
      [29, 30],  // Tableau & Fancy Dress
      [31, 32],  // Essay English Senior & Monoact
      [33, 34],  // Mime & Poetry English
    ];

    const itemMap = new Map<number, any>();
    items.forEach((it) => {
      itemMap.set(Number(it.display_order), it);
    });

    for (const [leftOrder, rightOrder] of eventPairs) {
      const leftItem = itemMap.get(leftOrder);
      const rightItem = rightOrder ? itemMap.get(rightOrder) : null;

      // Event Header Row
      const headerRow: any[] = [];
      headerRow[0] = leftItem ? `EVENTS :-${leftItem.category.toUpperCase()}` : '';
      if (rightItem) {
        headerRow[6] = `EVENTS :-${rightItem.category.toUpperCase()}`;
      }
      grid.push(headerRow);

      // Subheader Row
      const subHeaderRow: any[] = [];
      subHeaderRow[0] = 'SL.NO';
      subHeaderRow[1] = 'CHEST.NO';
      subHeaderRow[2] = 'NAME';
      subHeaderRow[3] = 'UNIT';
      subHeaderRow[4] = 'POSITION';
      if (rightItem) {
        subHeaderRow[6] = 'SL.NO';
        subHeaderRow[7] = 'CHEST.NO';
        subHeaderRow[8] = 'NAME';
        subHeaderRow[9] = 'UNIT';
        subHeaderRow[10] = 'POSITION';
      }
      grid.push(subHeaderRow);

      // 3 Position Rows (1st, 2nd, 3rd)
      const positions = [
        { label: 'FIRST', num: 1, nameKey: 'first_place_name', detKey: 'first_place_details' },
        { label: 'SECOND', num: 2, nameKey: 'second_place_name', detKey: 'second_place_details' },
        { label: 'THIRD', num: 3, nameKey: 'third_place_name', detKey: 'third_place_details' },
      ];

      for (const pos of positions) {
        const row: any[] = [];
        // Left
        row[0] = pos.num;
        if (leftItem && leftItem[pos.nameKey]) {
          const parsed = parseDetails(leftItem[pos.detKey]);
          row[1] = parsed.chest;
          row[2] = leftItem[pos.nameKey];
          row[3] = parsed.unit;
          row[4] = pos.label;
        }

        // Right
        if (rightItem) {
          row[6] = pos.num;
          if (rightItem[pos.nameKey]) {
            const parsed = parseDetails(rightItem[pos.detKey]);
            row[7] = parsed.chest;
            row[8] = rightItem[pos.nameKey];
            row[9] = parsed.unit;
            row[10] = pos.label;
          }
        }
        grid.push(row);
      }

      // Check for tie row on left (e.g. Essay English Senior 3rd place tie)
      if (leftOrder === 31) {
        const tieRow: any[] = [];
        tieRow[0] = 3;
        tieRow[1] = '253';
        tieRow[2] = 'CHRISTEENA RAICHAL GEORGE';
        tieRow[3] = 'KAVIYOOR';
        tieRow[4] = 'THIRD';
        grid.push(tieRow);
      }

      // Empty separator row
      grid.push([]);
    }

    // Add Church Point Table Section
    grid.push([]);
    grid.push(['Point Table - CHURCH']);
    grid.push([]);

    const pointTableHeaders = [
      'Sl.No', 'Unit', 'Light Music Boys', 'Solo Western Jr Boys', 'Solo Eastern Jr Boys',
      'Solo Western Sr Boys', 'Solo Eastern Sr Boys', 'Light Music Girls', 'Solo Western Jr Girls',
      'Solo Eastern Jr Girls', 'Solo Western Sr Girls', 'Solo Eastern Sr Girls', 'Organ Recital',
      'Instrumental GUITAR', 'Instrumental Wind', 'Instrumental Percussion', 'Quartet',
      'Group Song', 'Tableau', 'Margamkali', 'Mimicry', 'Mono Act', 'Fancy Dress',
      'Cartoon', 'Water Colour', 'Pencil Drawing', 'Short Story English', 'Essay Eng SR',
      'Essay Mal JR', 'Poetry English', 'Poetry Malayalam', 'Short Story Malayalam',
      'Elocution Mal Jr', 'Elocution Eng Jr', 'Elocution Mal Sr', 'Elocution Eng Sr', 'TOTAL',
    ];

    grid.push(pointTableHeaders);

    // Section 1 Churches (1 to 12)
    churches.filter((c: any) => c.section === 1).forEach((c: any) => {
      const breakdown = c.event_scores ? JSON.parse(String(c.event_scores)) : {};
      const row: any[] = [c.sl_no, c.unit_name];
      for (let i = 2; i < pointTableHeaders.length - 1; i++) {
        const eventName = pointTableHeaders[i];
        row.push(breakdown[eventName] !== undefined ? breakdown[eventName] : '');
      }
      row.push(c.total_points);
      grid.push(row);
    });

    grid.push([]);
    grid.push(pointTableHeaders);

    // Section 2 Churches (13 to 23)
    churches.filter((c: any) => c.section === 2).forEach((c: any) => {
      const breakdown = c.event_scores ? JSON.parse(String(c.event_scores)) : {};
      const localSlNo = c.sl_no - 12;
      const row: any[] = [localSlNo, c.unit_name];
      for (let i = 2; i < pointTableHeaders.length - 1; i++) {
        const eventName = pointTableHeaders[i];
        row.push(breakdown[eventName] !== undefined ? breakdown[eventName] : '');
      }
      row.push(c.total_points);
      grid.push(row);
    });

    // Create Sheet 1: Master Results & Point Table
    const wsMaster = XLSX.utils.aoa_to_sheet(grid);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsMaster, 'Results & Point Table');

    // Create Sheet 2: Church Championship Standings
    const sortedChurches = [...churches].sort((a: any, b: any) => b.total_points - a.total_points);
    const churchLeaderboard = sortedChurches.map((c: any, idx: number) => ({
      Rank: idx + 1,
      'Church Unit': c.unit_name,
      'Total Points': c.total_points,
      Section: `Section ${c.section}`,
    }));
    const wsLeaderboard = XLSX.utils.json_to_sheet(churchLeaderboard);
    XLSX.utils.book_append_sheet(wb, wsLeaderboard, 'Church Standings');

    // Create Sheet 3: Clean Events Table
    const eventsClean = items.map((it: any) => ({
      '#': it.display_order,
      Category: it.category,
      Round: it.round,
      Segment: it.segment || '',
      Status: it.status,
      '1st Place': it.first_place_name || 'Not announced',
      '1st Place Details': it.first_place_details || '',
      '2nd Place': it.second_place_name || 'Not announced',
      '2nd Place Details': it.second_place_details || '',
      '3rd Place': it.third_place_name || 'Not announced',
      '3rd Place Details': it.third_place_details || '',
      Notes: it.notes || '',
    }));
    const wsEvents = XLSX.utils.json_to_sheet(eventsClean);
    XLSX.utils.book_append_sheet(wb, wsEvents, 'All Events Summary');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Talent_Show_Official_Master_Results_2026.xlsx"',
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate master Excel sheet' },
      { status: 500 }
    );
  }
}
